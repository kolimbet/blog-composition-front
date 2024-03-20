<template>
  <div>
    <TheTopLine />

    <div
      class="container-md mw-xl-5xl my-3 py-3 px-2 px-md-0 min-vh-50 border border-2 border-start-0 border-end-0 border-blue"
    >
      <RouterView v-if="getInitiated" />
      <TheLoadingComponent v-else />
    </div>
  </div>
</template>

<script setup>
import TheTopLine from "./components/inc/TheTopLine.vue";
import TheLoadingComponent from "./components/TheLoadingComponent.vue";

import { getInitiated } from "./composables/storeAuth";
</script>

<style>
#app {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
./components/inc/TheTopLine.vue
