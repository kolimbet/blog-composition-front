<template>
  <div class="post-item">
    <div
      v-if="post"
      class="mb-2 d-flex justify-content-between align-items-center gap-3"
    >
      <div>
        <h2 class="mb-2">{{ post?.title }}</h2>
        <div class="fs-sm text-secondary">
          <i class="fa fa-clock-o me-1" aria-hidden="true"></i
          ><span>{{ publishedAt }}</span>
        </div>
      </div>

      <div class="post-author-label">
        <img :src="authorAvatarURL" />
        <div>{{ post.author.name }}</div>
      </div>
    </div>
    <div v-else>
      <h2 class="text-center">{{ `Post "${props.postSlug}"` }}</h2>
    </div>

    <!-- Request Error -->
    <div ref="refErrorMessage">
      <ErrorSingle
        :is-error="errorTrigger"
        :error-object="errorObject"
        :reload-trigger="triggerForReloadingErrors"
        class="mb-4"
      />
    </div>

    <div v-if="post">
      <div v-html="post.excerpt_html" class="post-excerpt ql-output"></div>

      <div v-html="post.content_html" class="post-content ql-output"></div>

      <div
        v-if="hasTags"
        class="d-flex flex-wrap gap-0-75rem align-items-center"
      >
        <span class="text-secondary">Tags:</span>
        <RouterLink
          v-for="tag in tagsList"
          :key="tag.id"
          :to="{ name: 'posts_by_tag', params: { tagSlug: tag.slug } }"
          class="text-decoration-none"
          >#{{ tag.name }}</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";

import { computed, defineProps, onMounted, ref } from "vue";
import { useRequest } from "@/composables/request";
import { apiPostItemFeed } from "@/api";
import { dateFromTimestamp } from "@/service-functions";

const props = defineProps({
  postSlug: [Number, String],
});

const post = ref(null);

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const publishedAt = computed(() =>
  post.value ? dateFromTimestamp(post.value.published_at) : ""
);
const authorAvatarURL = computed(() =>
  post.value?.author?.avatar
    ? post.value.author.avatar.full_url
    : "/images/default_avatar.png"
);
const hasTags = computed(() => post.value?.tags?.length);
const tagsList = computed(() => (hasTags.value ? post.value.tags : []));

function requestPost() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();
  apiPostItemFeed(props.postSlug)
    .then((postData) => {
      post.value = postData;
      // console.log(postData);
    })
    .catch((err) => {
      setError(err);
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}

onMounted(() => {
  requestPost();
});
</script>
