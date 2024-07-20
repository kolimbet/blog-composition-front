<template>
  <div>
    <Transition name="slide-left" mode="out-in">
      <div v-if="!getAuthorized" class="mb-3 text-center">
        <RouterLink :to="{ name: 'login' }">Log in</RouterLink> to be able to
        add a comment.
      </div>

      <div v-else-if="getIsBanned" class="mb-3 text-center text-red-dark">
        You are banned and cannot comment
      </div>

      <div v-else class="comment-add comment-shadow">
        <!-- Request Error -->
        <div ref="refErrorMessage">
          <ErrorSingle
            :is-error="errorTrigger"
            :error-object="errorObject"
            :reload-trigger="triggerForReloadingErrors"
            class="mb-4"
          />
        </div>

        <div class="mb-2">
          <label for="addComment" class="ps-1 fs-sm text-secondary"
            >Comment text</label
          >
          <EditorComment
            v-model:content="form.text_raw"
            @update:html="form.text_html = $event"
            @keydown.enter="storeComment()"
            placeholder="Comment text"
          />

          <ErrorList
            :error-list="v$.form.text_raw.$errors"
            :reload-trigger="triggerForReloadingErrors"
          />
        </div>

        <div class="text-end">
          <button @click="storeComment()" class="btn btn-primary">Add</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import ErrorList from "../inc/ErrorList.vue";
import EditorComment from "../quill/EditorComment.vue";

import { computed, defineEmits, defineProps, ref } from "vue";
import { useRequest } from "@/composables/request";
import useVuelidate from "@vuelidate/core";
import { helpers } from "@vuelidate/validators";
import { deltaMinLength } from "@/validators";
import { Delta } from "quill/core";
import _ from "lodash";
import { apiPostCommentAdd } from "@/api";
import { getAuthorized, getIsBanned } from "@/composables/storeAuth.js";

const props = defineProps({
  postId: [null, String, Number],
});
const emit = defineEmits(["add"]);

const form = ref({
  text_raw: new Delta(),
  text_html: "",
});

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const commentRules = computed(() => ({
  form: {
    text_raw: {
      deltaMinLength: helpers.withMessage(
        ({ $response }) => $response?.message || "Invalid Data",
        deltaMinLength(5)
      ),
    },
  },
}));
const v$ = useVuelidate(
  commentRules,
  { form },
  {
    $lazy: true,
    $scope: false,
  }
);

function clearForm() {
  reloadErrors();
  form.value.text_raw = new Delta();
  form.value.text_html = "";
  v$.value.$reset();
}

function storeComment() {
  if (!props.postId) {
    setError("Error: postId was not passed");
    return;
  }
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  v$.value.$validate().then(() => {
    if (v$.value.$invalid) {
      requestProcessing.value = false;
    } else {
      const data = _.cloneDeep(form.value);
      data.text_raw = JSON.stringify(data.text_raw);

      apiPostCommentAdd(props.postId, data)
        .finally(() => {
          requestProcessing.value = false;
        })
        .then((newComment) => {
          emit("add", newComment.id);
          clearForm();
        })
        .catch((err) => {
          setError(err);
        });
    }
  });
}
</script>
