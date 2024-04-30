<template>
  <div class="min-h-50vh">
    <h3 class="text-center">Your posts</h3>

    <div class="mb-3 d-flex justify-content-between align-items-center gap-3">
      <BaseIconUpdate @click="requestPosts()" />

      <BaseButtonPill
        @click="$router.push({ name: 'post_create' })"
        :text="'Add'"
        :title="'Add new one'"
        class="btn-green"
      >
        <i class="fa fa-plus-circle me-1" aria-hidden="true"></i>
      </BaseButtonPill>
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

    <template v-if="hasPosts">
      <div class="account-post-list">
        <TransitionGroup name="list-slide-left">
          <PostPreviewAdmin
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
      <div class="mb-3 text-center">
        Posts not found. Click on the Add button to open the upload form.
      </div>
    </template>
  </div>
</template>

<script setup>
import BaseIconUpdate from "../base/BaseIconUpdate.vue";
import BaseButtonPill from "../base/BaseButtonPill.vue";
import ErrorSingle from "../inc/ErrorSingle.vue";
import PostPreviewAdmin from "./PostPreviewAdmin.vue";
import PaginationLine from "../inc/PaginationLine.vue";

import { usePagination } from "@/composables/pagination";
import { useRequest } from "@/composables/request";
import { computed, onMounted, ref, watch } from "vue";
import { apiPostListAdmin } from "@/api";

const postList = ref(null);

const {
  paginationPage,
  paginationTotalPages,
  paginationRoutePath,
  paginationLinks,
  setPaginationParams,
} = usePagination();

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

  apiPostListAdmin(paginationPage.value)
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
