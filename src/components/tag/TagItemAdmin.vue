<template>
  <div class="col">
    <div
      class="h-percent-100 px-2 py-2 rounded rounded-2 border border-1 border-blue d-flex align-items-center"
    >
      <div class="w-percent-100">
        <!-- Request Error -->
        <div ref="refErrorMessage">
          <ErrorSingle
            :is-error="errorTrigger"
            :error-object="errorObject"
            :reload-trigger="triggerForReloadingErrors"
            class="mb-2"
          />
        </div>

        <div class="d-flex justify-content-between gap-0-75rem">
          <Transition name="folding-y-100" mode="out-in">
            <div v-if="editingTrigger" class="flex-grow-1">
              <div class="mb-2">
                <input
                  v-model="form.name"
                  ref="refEditingTag"
                  @keydown.enter="editingTagFinish()"
                  @keydown.esc="editingTagCancel()"
                  type="text"
                  class="form-control"
                  placeholder="Tag name"
                />

                <ErrorList
                  :error-list="v$.form.name.$errors"
                  :reload-trigger="triggerForReloadingErrors"
                />
              </div>

              <div
                class="d-flex justify-content-center align-items-center gap-0-75rem"
              >
                <BaseButtonPill
                  @click="editingTagFinish()"
                  :text="'Update'"
                  :title="'Update name'"
                  class="btn-green"
                >
                  <i class="fa fa-floppy-o me-2" aria-hidden="true"></i>
                </BaseButtonPill>

                <BaseButtonPill
                  @click="editingTagCancel()"
                  :text="'Close'"
                  :title="'Close form'"
                  class="btn-red"
                >
                  <i class="fa fa-times-circle me-2" aria-hidden="true"></i>
                </BaseButtonPill>
              </div>
            </div>

            <div v-else @click="dkAction(editingTagStart)" class="flex-grow-1">
              {{ props.tag.name }}
            </div>
          </Transition>

          <div
            @click="dkAction(deleteTag)"
            class="w-5 text-secondary text-red-dark-hover cursor-pointer"
          >
            <i class="fa fa-trash-o fs-4 lh-1"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import ErrorList from "../inc/ErrorList.vue";
import BaseButtonPill from "../base/BaseButtonPill.vue";

import { computed, defineEmits, defineProps, ref } from "vue";
import { useRequest } from "@/composables/request";
import { useDoubleClick } from "@/composables/doubleClick";
import { apiTagCheckName, apiTagDestroy, apiTagUpdate } from "@/api";
import { helpers, maxLength, minLength, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const props = defineProps({
  tag: Object,
});
const emit = defineEmits(["delete", "update"]);

const form = ref({
  name: "",
});
const refEditingTag = ref(null);
const editingTrigger = ref(false);
const editingTransition = 1000;

const { dkSetActionList, dkAction } = useDoubleClick();
dkSetActionList([deleteTag, editingTagStart]);

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
      apiTagCheckName(value, props.tag.id)
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

function uploadDataToForm() {
  form.value.name = props.tag.name;
}

function editingTagStart() {
  if (editingTrigger.value) return;
  uploadDataToForm();
  reloadErrors();
  editingTrigger.value = true;
  setTimeout(() => {
    refEditingTag.value.focus();
  }, editingTransition);
}

function editingTagCancel() {
  reloadErrors();
  v$.value.$reset();
  editingTrigger.value = false;
}

function editingTagFinish() {
  if (requestProcessing.value) return;
  if (props.tag.name !== form.value.name) {
    requestProcessing.value = true;
    reloadErrors();

    v$.value.$validate().then(() => {
      // console.log(v$.value);
      if (v$.value.$invalid) {
        requestProcessing.value = false;
      } else {
        apiTagUpdate(props.tag.id, form.value.name)
          .then((changedTag) => {
            emit("update", changedTag);
            editingTagCancel();
          })
          .catch((err) => {
            setError(err);
          })
          .finally(() => {
            requestProcessing.value = false;
          });
      }
    });
  } else {
    editingTrigger.value = false;
  }
}

function deleteTag() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiTagDestroy(props.tag.id)
    .then(() => {
      emit("delete");
    })
    .catch((err) => {
      setError(err);
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}
</script>
