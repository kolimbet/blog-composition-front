<template>
  <div class="mt-3">
    <TheCommentCreate
      :post-id="props.postId"
      @add="addCommentHandler($event)"
    />

    <!-- Request Error -->
    <div ref="refErrorMessage">
      <ErrorSingle
        :is-error="errorTrigger"
        :error-object="errorObject"
        :reload-trigger="triggerForReloadingErrors"
        class="mb-4"
      />
    </div>

    <template v-if="hasComments">
      <div class="mb-3">
        <TransitionGroup name="list-slide-left">
          <CommentItem
            v-for="comment in commentsList"
            :key="comment.id"
            :comment="comment"
            @delete="deleteComment(comment.id)"
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
import TheCommentCreate from "./TheCommentCreate.vue";

import { usePaginationBackend } from "@/composables/paginationBackend";
import { useRequest } from "@/composables/request";
import { computed, defineProps, onMounted, ref, watch } from "vue";
import { apiCommentDestroy, apiPostCommentsList } from "@/api";

const props = defineProps({
  postId: [null, String, Number],
});

const commentsList = ref(null);
const initiated = ref(false);

const updateDataTrigger = ref(false);
const goToComment = ref(null);

const animationDelay = 1000;

const {
  paginationPage,
  paginationTotalPages,
  paginationRoutePath,
  paginationLinks,
  setPaginationParams,
  goToLastPage,
  goToNextPage,
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

const hasComments = computed(() => commentsList.value?.length ?? false);

function requestComments() {
  if (!props.postId) return;
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiPostCommentsList(props.postId, paginationPage.value)
    .finally(() => {
      requestProcessing.value = false;
      initiated.value = true;
    })
    .then((comments) => {
      // console.log(comments);
      setPaginationParams(comments);
      commentsList.value = comments.data;
      updateDataTrigger.value = !updateDataTrigger.value;
    })
    .catch((err) => {
      setError(err);
      setPaginationParams({ pagination: null, links: null });
      commentsList.value = null;
    });
}

watch(
  () => props.postId,
  () => {
    requestComments();
  }
);
watch(paginationPage, () => {
  requestComments();
});

function deleteComment(commentId) {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiCommentDestroy(commentId)
    .finally(() => {
      requestProcessing.value = false;
    })
    .then((res) => {
      console.log(res);
      commentsList.value.splice(
        commentsList.value.findIndex((el) => el.id === commentId),
        1
      );

      // reload current comments page
      requestComments();
    })
    .catch((err) => {
      setError(err);
    });
}

function addCommentHandler(newCommentId) {
  goToComment.value = newCommentId;
  if (paginationPage.value < paginationTotalPages.value) {
    goToLastPage();
  } else {
    requestComments();
  }
}

function findCommentById(commentId) {
  return commentsList.value.some((el) => el.id == commentId);
}

watch(updateDataTrigger, () => {
  if (goToComment.value && hasComments.value) {
    if (findCommentById(goToComment.value)) {
      const commentAnchor = "comment-" + goToComment.value;
      setTimeout(() => {
        const commentElt = document.getElementById(commentAnchor);
        if (commentElt) commentElt.scrollIntoView();
      }, animationDelay);
      goToComment.value = null;
    } else {
      if (paginationPage.value < paginationTotalPages.value) {
        goToNextPage();
      } else {
        setError(
          "goToComment error: couldn't find a comment #" + goToComment.value
        );
        goToComment.value = null;
      }
    }
  }
});

onMounted(() => {
  requestComments();
});
</script>
