<template>
  <div class="comment" :class="[commentBg]">
    <div class="label-id">#{{ props.comment.id }}</div>

    <aside class="d-flex align-items-center mb-2">
      <img :src="authorAvatarURL" alt="Avatar" class="comment-avatar" />
      <div>
        <h6>{{ props.comment.author.name }}</h6>
        <div class="text-secondary fs-sm">
          <i class="fa fa-clock-o me-1" aria-hidden="true"></i
          ><span>{{ publishedAt }}</span>
        </div>
      </div>
    </aside>

    <div v-html="props.comment.text_html" class="ql-output"></div>

    <!-- <div class="d-flex justify-content-between">
      <div class="d-flex align-items-center cursor-pointer link-secondary">
        <i class="fa fa-heart-o fs-5 link-red fw-bold" aria-hidden="true"></i
        ><span class="ms-1">3</span>
      </div>
      <div class="d-flex align-items-center link-secondary cursor-pointer">
        <i class="fa fa-comment-o fs-5" aria-hidden="true"></i
        ><span class="ms-1">Comment</span>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { dateFromTimestamp } from "@/service-functions";
import { computed, defineProps } from "vue";

const props = defineProps({
  comment: Object,
});

const authorAvatarURL = computed(() =>
  props.comment?.author?.avatar
    ? props.comment.author.avatar.full_url
    : "/images/default_avatar.png"
);

const publishedAt = computed(() =>
  props.comment.published_at
    ? dateFromTimestamp(props.comment.published_at)
    : "on moderation"
);

const commentBg = computed(() =>
  props.comment.is_published ? "" : "bg-light"
);
</script>
