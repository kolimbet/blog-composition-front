<template>
  <div class="min-h-50vh">
    <h2 class="text-center mb-4">Feed</h2>

    <!-- Request Error -->
    <div ref="refErrorMessage">
      <ErrorSingle
        :is-error="errorTrigger"
        :error-object="errorObject"
        :reload-trigger="triggerForReloadingErrors"
        class="mb-4"
      />
    </div>

    <template v-if="hasPosts">
      <div class="feed-post-list">
        <TransitionGroup name="list-slide-left">
          <PostPreviewFeed
            v-for="post in postList"
            :key="post.id"
            :post="post"
          />
        </TransitionGroup>
      </div>

      <PaginationLine
        :page="paginationPage"
        :totalPages="paginationTotalPages"
        :links="paginationLinks"
        :route-path="paginationRoutePath"
        class="text-center mb-2"
      />
    </template>
    <template v-else>
      <div class="mb-3 text-center">Posts not found.</div>
    </template>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import PostPreviewFeed from "./PostPreviewFeed.vue";
import PaginationLine from "../inc/PaginationLine.vue";

import { computed, onMounted, ref, watch } from "vue";
import { usePaginationBackend } from "@/composables/paginationBackend";
import { useRequest } from "@/composables/request";
import { apiPostListFeed } from "@/api";

const postList = ref(null);

const {
  paginationPage,
  paginationTotalPages,
  paginationRoutePath,
  paginationLinks,
  setPaginationParams,
} = usePaginationBackend();

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const hasPosts = computed(() => postList.value?.length ?? false);

function requestPosts() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiPostListFeed(paginationPage.value)
    .then((posts) => {
      // console.log(posts);
      setPaginationParams(posts);
      postList.value = posts.data;
    })
    .catch((err) => {
      setError(err);
      setPaginationParams({ pagination: null, links: null });
      postList.value = null;
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}

onMounted(() => {
  requestPosts();
});

watch(paginationPage, () => {
  requestPosts();
});
</script>
