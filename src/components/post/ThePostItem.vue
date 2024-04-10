<template>
  <div>
    <h2 class="text-center">Post "{{ props.postSlug }}"</h2>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  postSlug: [Number, String],
});
</script>
