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
    <ErrorSingle
      :is-error="errorTrigger"
      :error-object="errorObject"
      :reload-trigger="triggerForReloadingErrors"
      class="mb-4"
    />

    <template v-if="hasPosts">
      <div class="mb-3">
        <PostPreviewAccount
          v-for="post in postList.data"
          :key="post.id"
          :post="post"
        />
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
import PostPreviewAccount from "../post/PostPreviewAccount.vue";
import PaginationLine from "../inc/PaginationLine.vue";

import { useRequest } from "@/composables/request";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { apiPostListAccount } from "@/api";

const postList = ref(null);

const {
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

  apiPostListAccount(page.value)
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
