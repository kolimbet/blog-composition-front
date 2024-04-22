<template>
  <div>
    <h3 class="text-center">Changing password</h3>
    <div class="d-flex justify-content-center align-items-center min-h-50vh">
      <div class="w-percent-100 mw-md">
        <div ref="refMessage">
          <InfoMessage
            v-model:display="messageDisplay"
            :message="messageText"
            :message-type="messageType"
            class="mb-4"
          />
        </div>

        <!-- Request Error -->
        <div ref="refErrorMessage">
          <ErrorSingle
            :is-error="errorTrigger"
            :error-object="errorObject"
            :reload-trigger="triggerForReloadingErrors"
            class="mb-4"
          />
        </div>

        <div class="mb-4">
          <label for="form-password" class="fs-sm text-secondary"
            >Password</label
          >
          <input
            v-model="form.password"
            id="form-password"
            type="password"
            class="form-control"
            placeholder="Password"
          />

          <ErrorList
            :error-list="v$.form.password.$errors"
            :reload-trigger="triggerForReloadingErrors"
          />
        </div>

        <div class="mb-4">
          <label for="form-new-password" class="fs-sm text-secondary"
            >New password</label
          >
          <input
            v-model="form.new_password"
            id="form-new-password"
            type="password"
            class="form-control"
            placeholder="New password"
          />

          <ErrorList
            :error-list="v$.form.new_password.$errors"
            :reload-trigger="triggerForReloadingErrors"
          />
        </div>

        <div class="mb-4">
          <label for="form-new-password-repeat" class="fs-sm text-secondary"
            >Repeat new password</label
          >
          <input
            v-model="form.new_password_repeat"
            id="form-new-password-repeat"
            type="password"
            class="form-control"
            placeholder="Repeat new password"
          />

          <ErrorList
            :error-list="v$.form.new_password_repeat.$errors"
            :reload-trigger="triggerForReloadingErrors"
          />
        </div>

        <div class="mb-4">
          <BaseRequestButton
            @click="changePassword()"
            :text="'Update'"
            :processing="requestProcessing"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import ErrorList from "../inc/ErrorList.vue";
import BaseRequestButton from "../base/BaseRequestButton.vue";
import InfoMessage from "../inc/InfoMessage.vue";

import { computed, ref } from "vue";
import { useRequest } from "@/composables/request";
import useVuelidate from "@vuelidate/core";
import {
  required,
  minLength,
  maxLength,
  sameAs,
  helpers,
} from "@vuelidate/validators";
import { notSameAs } from "@/validators";
import { apiUserPasswordCheck, apiUserPasswordUpdate } from "@/api";
import { useMessage } from "@/composables/message";

const form = ref({
  password: "",
  new_password: "",
  new_password_repeat: "",
});

const {
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const { refMessage, messageDisplay, messageText, messageType, messageCreate } =
  useMessage();

const changePasswordRules = computed(() => ({
  form: {
    password: {
      checkCurrentPassword: helpers.withMessage(
        ({ $response }) => $response?.message || "Invalid Data",
        helpers.withAsync(validatingCurrentPassword)
      ),
    },
    new_password: {
      required,
      minLength: minLength(6),
      maxLength: maxLength(25),
      notCurrentPass: helpers.withMessage(
        () => "The new password must be different from the current one",
        notSameAs(form.value.password)
      ),
    },
    new_password_repeat: {
      required,
      sameAsPassword: helpers.withMessage(
        () => "The value must be equal to the New_password",
        sameAs(form.value.new_password)
      ),
    },
  },
}));

const v$ = useVuelidate(
  changePasswordRules,
  { form },
  {
    $lazy: true,
    $scope: false,
  }
);

function validatingCurrentPassword(value) {
  let result = {
    $valid: false,
    message: "The current password is entered incorrectly",
  };

  return new Promise((resolve, reject) => {
    // canceling the check if one of the previous ones is not passed
    if (!value.length) {
      result.message = "Value is required";
      reject(result);
    } else {
      apiUserPasswordCheck(value)
        .then((data) => {
          result.$valid = data;
          resolve(result);
        })
        .catch((err) => {
          // console.log(`set checkCurrentPassword error message: ${err}`);
          result.message = err;
          reject(result);
        });
    }
  });
}

function changePassword() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  v$.value.$validate().then(() => {
    // console.log(v$.value);
    if (v$.value.$invalid) {
      requestProcessing.value = false;
    } else {
      apiUserPasswordUpdate(form.value)
        .then(() => {
          messageCreate(
            "Password change completed successfully",
            "success",
            true
          );

          form.value.password = "";
          form.value.new_password = "";
          form.value.new_password_repeat = "";

          reloadErrors();
          v$.value.$reset();
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
</script>
