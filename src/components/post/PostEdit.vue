<template>
  <div>
    <h3 class="text-center">Editing a post #{{ props.postId }}</h3>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  postId: [Number, String],
});
</script>
