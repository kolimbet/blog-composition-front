<template>
  <div class="mt-3">
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
      <div class="mb-3">
        <TransitionGroup name="list-slide-left">
          <CommentItem
            v-for="comment in commentsList"
            :key="comment.id"
            :comment="comment"
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
    <template v-else-if="initiated">
      <div class="mb-3 text-center">Comments not found.</div>
    </template>
    <template v-else>
      <div class="mb-3 text-center">Loading...</div>
    </template>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import PaginationLine from "../inc/PaginationLine.vue";
import CommentItem from "./CommentItem.vue";

import { usePaginationBackend } from "@/composables/paginationBackend";
import { useRequest } from "@/composables/request";
import { computed, defineProps, onMounted, ref, watch } from "vue";
import { apiPostCommentsList } from "@/api";

const props = defineProps({
  postId: [null, String, Number],
});

const commentsList = ref(null);
const initiated = ref(false);

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

const hasPosts = computed(() => commentsList.value?.length ?? false);

function requestComments() {
  if (!props.postId) return;
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiPostCommentsList(props.postId, paginationPage.value)
    .then((comments) => {
      console.log(comments);
      setPaginationParams(comments);
      commentsList.value = comments.data;
    })
    .catch((err) => {
      setError(err);
      setPaginationParams({ pagination: null, links: null });
      commentsList.value = null;
    })
    .finally(() => {
      requestProcessing.value = false;
      initiated.value = true;
    });
}

onMounted(() => {
  requestComments();
});

watch(
  () => props.postId,
  () => {
    requestComments();
  }
);

watch(paginationPage, () => {
  requestComments();
});
</script>
