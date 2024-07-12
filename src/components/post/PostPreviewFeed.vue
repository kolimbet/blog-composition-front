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
            >{{ props.post.title }} #{{ props.post.id }}</RouterLink
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

    <!-- Request Error -->
    <div ref="refErrorMessage">
      <ErrorSingle
        :is-error="errorTrigger"
        :error-object="errorObject"
        :reload-trigger="triggerForReloadingErrors"
        class="mb-4"
      />
    </div>

    <div v-html="props.post.excerpt_html" class="post-excerpt ql-output"></div>

    <div
      class="d-flex justify-content-between align-items-center px-0-75rem py-2 bg-blue text-white rounded-2"
    >
      <div
        @click="toggleLike()"
        class="d-flex align-items-center cursor-pointer"
      >
        <i
          class="fa fa-heart-o fs-5"
          aria-hidden="true"
          :class="[likeIconClasses]"
        ></i
        ><span class="ms-1">{{ likesCounter }}</span>
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
import ErrorSingle from "../inc/ErrorSingle.vue";

import { computed, defineEmits, defineProps } from "vue";
import { dateFromTimestamp } from "@/service-functions";
import { getAuthorized, getUserId } from "@/composables/storeAuth";
import { useRequest } from "@/composables/request";
import { apiPostLikeAdd, apiPostLikeDestroy } from "@/api";

const props = defineProps({
  post: Object,
});

const emit = defineEmits(["likeAdd", "likeDestroy"]);

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const authorAvatarURL = computed(() =>
  props.post?.author?.avatar
    ? props.post.author.avatar.full_url
    : "/images/default_avatar.png"
);

const hasLikes = computed(() =>
  props.post.likes && props.post.likes?.length ? true : false
);
const likesCounter = computed(() =>
  hasLikes.value ? props.post.likes.length : 0
);
const isLikedByUser = computed(() =>
  hasLikes.value && getAuthorized.value
    ? props.post.likes.some((likeItem) => likeItem.user_id == getUserId.value)
    : false
);
const likeIconClasses = computed(() =>
  isLikedByUser.value ? "text-black fw-bold" : ""
);

function toggleLike() {
  if (!getAuthorized.value) return;
  requestProcessing.value = true;
  reloadErrors();

  if (isLikedByUser.value) {
    apiPostLikeDestroy(props.post.id)
      .then((deletedLikeId) => {
        emit("likeDestroy", deletedLikeId);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        requestProcessing.value = false;
      });
  } else {
    apiPostLikeAdd(props.post.id)
      .then((newLike) => {
        emit("likeAdd", newLike);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        requestProcessing.value = false;
      });
  }
}
</script>
