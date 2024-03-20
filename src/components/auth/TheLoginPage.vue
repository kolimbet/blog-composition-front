<template>
  <div>
    <h2 class="text-center">Login Form</h2>
    <div
      class="mb-4 d-flex justify-content-center align-items-center min-h-50vh"
    >
      <div class="w-percent-100 mw-md">
        <!-- Request Error -->

        <div class="mb-4">
          <label for="form-email" class="fs-sm text-secondary">Email</label>
          <input
            v-model="form.email"
            id="form-email"
            type="email"
            class="form-control"
            placeholder="Email"
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
        </div>

        <div class="mb-4 form-check">
          <input
            v-model="form.remember"
            id="remember-me"
            name="remember"
            type="checkbox"
            class="form-check-input"
            title="Remember me"
          />
          <label for="remember-me" class="form-check-label">Remember me</label>
        </div>

        <div class="mb-4">
          <BaseRequestButton
            @click="login()"
            :text="'Sing in'"
            :processing="processing"
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

import { ref } from "vue";
import { useRouter } from "vue-router";
import { actionLogin } from "@/composables/storeAuth";

const router = useRouter();

const form = ref({
  email: "",
  password: "",
  remember: false,
});

const processing = ref(false);

function login() {
  if (!processing.value && form.value.email && form.value.password) {
    processing.value = true;
    // console.log(form.value);

    // setTimeout(() => {
    actionLogin(form.value)
      .then((userData) => {
        form.value.email = form.value.password = "";
        console.log(`Вы успешно вошли как ${userData.name}`);
        router.replace({ name: "home" });
      })
      .catch((err) => {
        console.log("actionLogin() catch:", err);
        // setError(err);
      })
      .finally(() => {
        processing.value = false;
      });
    // }, 2000);
  }
}
</script>
