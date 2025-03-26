<template>
  <div class="position-relative">
    <BaseIconUpdate class="position-absolute end-1 top-0" />

    <h3 class="text-center">Home</h3>
    <div class="min-vh-50">
      <div
        class="pb-0-75rem mb-0-75rem border border-2 border-blue border-top-0 border-start-0 border-end-0 text-center"
      >
        <img
            :src="getAvatarUrl"
            alt="Current avatar"
            class="w-32 mx-auto mb-1 shadow"
          />
        <div><span class="fw-bold fs-5" title="Your login">{{ getUserName }}</span></div>
        <div class="mt-1 fs-sm">
          <span class="text-secondary me-2">Status:</span> 
          <span class="d-inline-block rounded px-2 text-white border-1 border-opacity-75" :class="[userStatusStyles]">{{ userStatus }}</span>
          <span v-if="getIsBanned" class="d-inline-block rounded px-2 ms-2 text-white border-1 border-opacity-75 bg-red border-red">banned</span>
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

      <div class="pb-0-75rem mb-4 border border-2 border-blue border-top-0 border-start-0 border-end-0">
        <div class="mb-2 text-secondary fw-bold text-center">Your activity:</div>
        <div class="d-flex flex-wrap justify-content-center gap-4">
          <div v-if="uaIsAdmin" class="text-green">
            <span class="me-2">posts:</span>
            <span class="fw-bold">{{ uaPostsCounter }}</span>
          </div>
          <div class="text-blue">
            <span class="me-2">comments:</span>
            <span class="fw-bold">{{ uaCommentsCounter }}</span>
          </div>
      </div>
      </div>
      

      <template v-if="uaIsAdmin">
        <div class="pb-0-75rem mb-4 border border-2 border-blue border-top-0 border-start-0 border-end-0">
          <div class="mb-2 text-secondary fw-bold text-center">Last post:</div>
          <PostPreviewFeed
              v-if="uaLastPost"
              :post="uaLastPost"
              @like-add="uaPostLikeAdd($event)"
              @like-destroy="uaPostLikeDestroy($event)"
            />
          <div v-else class="mb-4">not found</div>
        </div>
        
      </template>

      <div class="mb-2 text-secondary fw-bold text-center">Recent comments:</div>
      <div v-if="uaCommentsList" class="mb-4">
        <TransitionGroup name="list-slide-left">
          <CommentItem
            v-for="comment in uaCommentsList"
            :key="comment.id"
            :comment="comment"
            @delete="deleteComment(comment.id)"
          />
        </TransitionGroup>
      </div>
      <div v-else class="mb-2">not found</div>
    </div>
  </div>
</template>

<script setup>
import BaseIconUpdate from "../base/BaseIconUpdate.vue";
import ErrorSingle from "../inc/ErrorSingle.vue";
import PostPreviewFeed from "../post/PostPreviewFeed.vue";
import CommentItem from "../comment/CommentItem.vue";
import { computed, onMounted } from "vue";
import { apiUserAboutSelf, apiCommentDestroy } from "@/api";
import { useRequest } from "@/composables/request";
import { useUserAbout } from "@/composables/userAbout";

import {
  getAvatarUrl,
  getUserName,
  getIsAdmin,
  getIsBanned,
} from "@/composables/storeAuth";

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const {
  uaIsAdmin,
  uaCommentsCounter,
  uaPostsCounter,
  uaCommentsList,
  uaLastPost,
  uaSetUserData,
  uaPostLikeAdd,
  uaPostLikeDestroy
} = useUserAbout();

const userStatus = computed(() => getIsAdmin.value ? "admin" : "user");
const userStatusStyles = computed(() => getIsAdmin.value ? "bg-green border-green" : "bg-blue border-blue");

function requestData() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiUserAboutSelf()
    .finally(() => {
      requestProcessing.value = false;
    })
    .then(({ user, last_comments = null, last_post = null }) => {
      uaSetUserData(user, last_comments, last_post);
    })
    .catch((err) => {
      setError(err);
      uaSetUserData();
    });
}

function deleteComment(commentId) {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiCommentDestroy(commentId)
    .finally(() => {
      requestProcessing.value = false;
    })
    .then(() => {
      requestData();
    })
    .catch((err) => {
      setError(err);
    });
}

onMounted(() => {
  requestData();
});
</script>
