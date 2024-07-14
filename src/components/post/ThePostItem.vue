<template>
  <div class="post-item">
    <div
      v-if="post"
      class="mb-2 d-flex justify-content-between align-items-center gap-3"
    >
      <div>
        <h2 class="mb-2">{{ post.title }} #{{ post.id }}</h2>
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
        class="mb-3 d-flex flex-wrap gap-0-75rem align-items-center"
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
          ><span class="ms-1">{{ commentsCounter }}</span>
        </div>
        <a href="#" class="ms-3 link-white text-decoration-none">report</a>
      </div>
    </div>

    <TheCommentsListOfPost :post-id="postId" />
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import TheCommentsListOfPost from "../comment/TheCommentsListOfPost.vue";

import { computed, defineProps, onMounted, ref } from "vue";
import { useRequest } from "@/composables/request";
import { getAuthorized, getUserId } from "@/composables/storeAuth";
import { apiPostItemFeed, apiPostLikeAdd, apiPostLikeDestroy } from "@/api";
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

const postId = computed(() => (post.value ? post.value.id : null));
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

const hasLikes = computed(() =>
  post.value?.likes && post.value.likes?.length ? true : false
);
const likesCounter = computed(() =>
  hasLikes.value ? post.value.likes.length : 0
);
const isLikedByUser = computed(() =>
  hasLikes.value && getAuthorized.value
    ? post.value.likes.some((likeItem) => likeItem.user_id == getUserId.value)
    : false
);
const likeIconClasses = computed(() =>
  isLikedByUser.value ? "text-black fw-bold" : ""
);

const commentsCounter = computed(() => post.value?.comments_count ?? 0);

function toggleLike() {
  if (!getAuthorized.value) return;
  requestProcessing.value = true;
  reloadErrors();

  if (isLikedByUser.value) {
    apiPostLikeDestroy(postId.value)
      .then((deletedLikeId) => {
        post.value.likes.splice(
          post.value.likes.findIndex((like) => like.id == deletedLikeId),
          1
        );
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        requestProcessing.value = false;
      });
  } else {
    apiPostLikeAdd(postId.value)
      .then((newLike) => {
        post.value.likes.push(newLike);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        requestProcessing.value = false;
      });
  }
}

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
