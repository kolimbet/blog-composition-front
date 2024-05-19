<template>
  <Transition name="folding-y-300">
    <div
      v-if="props.isOpen"
      class="py-0-75rem mb-0-75rem border border-2 border-start-0 border-end-0 border-green"
    >
      <!-- Request Error -->
      <div ref="refErrorMessage">
        <ErrorSingle
          :is-error="errorTrigger"
          :error-object="errorObject"
          :reload-trigger="triggerForReloadingErrors"
          class="mb-2"
        />
      </div>

      <div class="mb-2">
        <label class="d-block fs-sm text-secondary">Name</label>
        <input
          v-model="form.name"
          ref="refNameInput"
          @keydown.enter="store()"
          @keydown.esc="emit('close')"
          type="text"
          class="form-control"
          placeholder="Name"
        />

        <ErrorList
          :error-list="v$.form.name.$errors"
          :reload-trigger="triggerForReloadingErrors"
        />
      </div>

      <div class="text-center">
        <BaseButtonPill
          @click="store()"
          :text="requestProcessing ? 'Please wait' : 'Store'"
          :title="'Store tag'"
          class="btn-green"
        >
          <i class="fa fa-floppy-o me-2" aria-hidden="true"></i>
        </BaseButtonPill>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import ErrorList from "../inc/ErrorList.vue";
import BaseButtonPill from "../base/BaseButtonPill.vue";

import { defineProps, defineEmits, ref, computed, watch, nextTick } from "vue";
import { useRequest } from "@/composables/request";
import { helpers, maxLength, minLength, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { apiTagCheckName, apiTagStore } from "@/api";

const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(["close", "add"]);

const form = ref({
  name: "",
});
const refNameInput = ref(null);
const requestToClearForm = ref(false);

const {
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const tagRules = computed(() => ({
  form: {
    name: {
      required,
      minLength: minLength(2),
      maxLength: maxLength(50),
      checkTagName: helpers.withMessage(
        ({ $response }) => $response?.message || "Invalid Data",
        helpers.withAsync(checkTagName)
      ),
    },
  },
}));

const v$ = useVuelidate(
  tagRules,
  { form },
  {
    $lazy: true,
    $scope: false,
  }
);

async function checkTagName(value) {
  let result = {
    $valid: false,
    message: "Error",
  };

  return new Promise((resolve, reject) => {
    if (
      v$.value.form.name.required.$invalid ||
      v$.value.form.name.minLength.$invalid ||
      v$.value.form.name.maxLength.$invalid
    ) {
      result.$valid = true;
      resolve(result);
    } else {
      apiTagCheckName(value)
        .then((data) => {
          result.$valid = data;
          resolve(result);
        })
        .catch((err) => {
          result.message = err;
          reject(result);
        });
    }
  });
}

function store() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  v$.value.$validate().then(() => {
    // console.log(v$.value);
    if (v$.value.$invalid) {
      requestProcessing.value = false;
    } else {
      apiTagStore(form.value.name)
        .then((newTag) => {
          emit("add", newTag);
          emit("close");
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          requestProcessing.value = false;
        });
    }
  });
}

function clearForm() {
  reloadErrors();
  form.value.name = "";
  v$.value.$reset();
}
function attemptToClearForm() {
  if (requestProcessing.value) requestToClearForm.value = true;
  else clearForm();
}

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue === false) attemptToClearForm();
    else
      nextTick(() => {
        refNameInput.value.focus();
      });
  }
);

watch(requestProcessing, (newValue) => {
  if (newValue === false && requestToClearForm.value) {
    clearForm();
    requestToClearForm.value = false;
  }
});
</script>
