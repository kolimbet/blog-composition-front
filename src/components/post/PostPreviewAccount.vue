<template>
  <div
    class="d-flex justify-content-between align-items-center gap-0-75rem pb-2 mb-2 border-bottom border-1"
  >
    <div class="d-flex align-items-center gap-2">
      <div class="min-w-12">#{{ props.post.id }}</div>
      <div>{{ props.post.title }}</div>
    </div>

    <div class="">
      <RouterLink
        :to="{
          name: 'post_edit',
          params: { postId: props.post.id },
        }"
        class="link-secondary fs-3 text-decoration-none"
        title="Edit"
      >
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  post: Object,
});
</script>
