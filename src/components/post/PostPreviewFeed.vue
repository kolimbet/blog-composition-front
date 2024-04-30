<template>
  <div class="post-preview">
    <div class="mb-2 d-flex justify-content-between align-items-center gap-3">
      <div>
        <h3 class="mb-2">
          <RouterLink
            :to="{
              name: 'post',
              params: { postSlug: props.post.slug || props.post.id },
            }"
            >{{ props.post.title }}</RouterLink
          >
        </h3>

        <div class="text-secondary fs-sm">
          <i class="fa fa-clock-o me-1" aria-hidden="true"></i
          ><span>{{ dateFromTimestamp(props.post.published_at) }}</span>
        </div>
      </div>

      <div class="post-author-label">
        <img :src="authorAvatarURL" />
        <div>{{ post.author.name }}</div>
      </div>
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
import { computed, defineProps } from "vue";
import { dateFromTimestamp } from "@/service-functions";

const props = defineProps({
  post: Object,
});

const authorAvatarURL = computed(() =>
  props.post?.author?.avatar
    ? props.post.author.avatar.full_url
    : "/images/default_avatar.png"
);
</script>
