<template>
  <div class="post-preview">
    <h3 class="mb-0">
      <RouterLink
        :to="{
          name: 'post',
          params: { postSlug: props.post.slug || props.post.id },
        }"
        >{{ props.post.title }}</RouterLink
      >
    </h3>

    <div class="mb-2 text-secondary fs-sm">
      <i class="fa fa-clock-o me-1" aria-hidden="true"></i
      ><span>{{ dateFromTimestamp(props.post.published_at) }}</span>
    </div>

    <div v-html="props.post.excerpt_html" class="post-excerpt ql-output"></div>

    <div
      class="d-flex justify-content-between align-items-center px-0-75rem py-2 bg-blue text-white rounded-2"
    >
      <div class="d-flex align-items-center cursor-pointer">
        <i class="fa fa-heart-o fs-5" aria-hidden="true"></i
        ><span class="ms-1">?</span>
      </div>

      <div class="d-flex align-items-center">
        <div class="d-flex align-items-center cursor-pointer">
          <i class="fa fa-comment-o fs-5" aria-hidden="true"></i
          ><span class="ms-1">?</span>
        </div>
        <a href="#" class="ms-3 link-white text-decoration-none">report</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { dateFromTimestamp } from "@/service-functions";

const props = defineProps({
  post: Object,
});
</script>
