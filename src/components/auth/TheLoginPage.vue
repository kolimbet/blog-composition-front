<template>
  <div>
    <h2 class="text-center">Login Form</h2>
    <div
      class="mb-4 d-flex justify-content-center align-items-center min-h-50vh"
    >
      <div class="w-percent-100 mw-md">
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
          <label for="form-email" class="fs-sm text-secondary">Email</label>
          <input
            v-model="form.email"
            id="form-email"
            type="email"
            class="form-control"
            placeholder="Email"
          />

          <ErrorList
            :error-list="v$.form.email.$errors"
            :reload-trigger="triggerForReloadingErrors"
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

        <div class="mb-4 form-check">
          <input
            v-model="form.remember"
            id="form-remember-me"
            type="checkbox"
            class="form-check-input"
            title="Remember me"
          />
          <label for="form-remember-me" class="form-check-label"
            >Remember me</label
          >
        </div>

        <div class="mb-4">
          <BaseRequestButton
            @click="login()"
            :text="'Sing in'"
            :processing="requestProcessing"
          />
        </div>

        <div class="mb-4 text-center">
          <RouterLink
            :to="{ name: 'register' }"
            class="text-decoration-none link-blue fw-bold"
          >
            Register new Account
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseRequestButton from "../base/BaseRequestButton.vue";
import ErrorSingle from "../inc/ErrorSingle.vue";
import ErrorList from "../inc/ErrorList.vue";

import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { actionLogin } from "@/composables/storeAuth";
import { useRequest } from "@/composables/request.js";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";

const router = useRouter();

const form = ref({
  email: "",
  password: "",
  remember: false,
});

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const loginRules = computed(() => ({
  form: {
    email: {
      required,
      email,
    },
    password: {
      required,
    },
  },
}));

const v$ = useVuelidate(
  loginRules,
  { form },
  {
    $lazy: true,
    $scope: false,
  }
);

function login() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  v$.value.$validate().then(() => {
    if (v$.value.$invalid) {
      requestProcessing.value = false;
    } else {
      actionLogin(form.value)
        .then((userData) => {
          console.log(`Вы успешно вошли как ${userData.name}`);
          router.push({ name: "home" });
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
