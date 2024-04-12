<template>
  <div>
    <h2 class="text-center">Access denied</h2>
    <div class="min-h-50vh pt-3">
      <div class="alert alert-danger text-center">
        You don't have enough rights to access the page
        <a v-if="$route.query.deniedURL" :href="$route.query.deniedURL">{{
          $route.query.deniedURL
        }}</a>
      </div>
      <p class="text-center">
        <RouterLink :to="{ name: 'home' }" title="Home Page"
          >Go back to the home page</RouterLink
        >
      </p>
    </div>
  </div>
</template>

<script setup></script>
