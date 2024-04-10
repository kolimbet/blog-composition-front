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
            v-for="post in postList.data"
            :key="post.id"
            :post="post"
          />
        </TransitionGroup>
      </div>

      <PaginationLine
        :page="page"
        :totalPages="totalPages"
        :links="paginationLinks"
        :url="$route.path"
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
import { useRequest } from "@/composables/request";
import { useRoute } from "vue-router";
import { apiPostListFeed } from "@/api";

const postList = ref(null);

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const route = useRoute();

const page = computed(() => (route.query.page ? +route.query.page : 1));
const hasPosts = computed(() => postList.value?.data.length);
const totalPages = computed(() => {
  if (postList.value?.total && postList.value?.per_page)
    return Math.ceil(postList.value.total / postList.value.per_page);
  else return 1;
});
const paginationLinks = computed(() => ({
  first: postList.value?.first_page_url ?? false,
  prev: postList.value?.prev_page_url ?? false,
  next: postList.value?.next_page_url ?? false,
  last: postList.value?.last_page_url ?? false,
}));

function requestPosts() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiPostListFeed(page.value)
    .then((posts) => {
      postList.value = posts;
    })
    .catch((err) => {
      setError(err);
      postList.value = null;
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}

onMounted(() => {
  requestPosts();
});

watch(page, () => {
  requestPosts();
});
</script>
