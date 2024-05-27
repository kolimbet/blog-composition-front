<template>
  <div>
    <h3 class="text-center">Creating a new post</h3>
    <template v-if="postStoreIsCompleted">
      <div class="d-flex justify-content-center align-items-center min-h-50vh">
        <div class="w-percent-100 mw-md">
          <div
            class="px-3 py-2 mx-auto rounded-2 border border-green border-opacity-50 bg-green-light text-green-dark"
          >
            <div class="mb-4 text-center">
              Post store completed successfully.
            </div>

            <div class="text-center">
              <button
                @click="
                  $router.push({
                    name: 'post_edit',
                    params: { postId: newPostId },
                  })
                "
                title="Edit new post"
                class="btn btn-green text-white w-24 mx-2"
              >
                Edit
              </button>

              <button
                @click="
                  $router.push({
                    name: 'admin_posts',
                  })
                "
                title="Go to the list of posts"
                class="btn btn-green text-white w-24 mx-2"
              >
                Posts list
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Request Error -->
      <div ref="refErrorMessage">
        <ErrorSingle
          :is-error="errorTrigger"
          :error-object="errorObject"
          :reload-trigger="triggerForReloadingErrors"
          class="mb-4"
        />
      </div>

      <div class="mb-4">
        <label for="form-title" class="fs-sm text-secondary">Title</label>
        <input
          v-model="form.title"
          id="form-title"
          type="text"
          class="form-control"
          placeholder="Title"
        />

        <ErrorList
          :error-list="v$.form.title.$errors"
          :reload-trigger="triggerForReloadingErrors"
        />
      </div>

      <!-- slug -->
      <div class="mb-4">
        <label for="form-slug" class="fs-sm text-secondary">Slug</label>
        <input
          v-model="form.slug"
          id="form-slug"
          type="text"
          class="form-control"
          placeholder="Slug"
        />

        <ErrorList
          :error-list="v$.form.slug.$errors"
          :reload-trigger="triggerForReloadingErrors"
        />

        <div class="mt-2">
          <button
            @click="generateSlug()"
            type="submit"
            class="w-56 p-px mt-px mx-auto d-flex justify-content-center align-items-center rounded-md border border-secondary border-green-hover border-opacity-75 bg-secondary bg-green-hover rounded-2 text-white cursor-pointer"
          >
            <i class="fa fa-clone me-1" aria-hidden="true"></i>
            Generate from Title
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label class="fs-sm text-secondary">Excerpt</label>
        <EditorPost
          v-model:content="form.excerpt_raw"
          @update:html="form.excerpt_html = $event"
          placeholder="Excerpt"
        />

        <ErrorList
          :error-list="v$.form.excerpt_raw.$errors"
          :reload-trigger="triggerForReloadingErrors"
        />
      </div>

      <div class="mb-4">
        <label class="fs-sm text-secondary">Excerpt</label>
        <EditorPost
          v-model:content="form.content_raw"
          @update:html="form.content_html = $event"
          placeholder="Excerpt"
        />

        <ErrorList
          :error-list="v$.form.content_raw.$errors"
          :reload-trigger="triggerForReloadingErrors"
        />
      </div>

      <div class="mb-4 form-check">
        <input
          v-model="form.is_published"
          id="form-is-published"
          type="checkbox"
          class="form-check-input"
          title="is published"
        />
        <label for="form-is-published" class="form-check-label"
          >is published</label
        >
      </div>

      <TheTagListOfPost v-model:list-of-attached-tags="tagsList" class="mb-4" />

      <ThePostImageList
        :image-folder="form.image_path"
        @update:image-folder="updateImageFolder($event)"
        :image-list="imageList"
        @add-image="addImageToList($event)"
        @delete-image="deleteImageFromList($event)"
        class="mb-4"
      />

      <div class="mb-4">
        <BaseRequestButton
          @click="storePost()"
          :text="'Store'"
          :processing="requestProcessing"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import ErrorList from "../inc/ErrorList.vue";
import BaseRequestButton from "../base/BaseRequestButton.vue";
import EditorPost from "../quill/EditorPost.vue";
import ThePostImageList from "../image/ThePostImageList.vue";
import TheTagListOfPost from "../tag/TheTagListOfPost.vue";

import { computed, onBeforeUnmount, ref } from "vue";
import { useRequest } from "@/composables/request";
import { Delta } from "quill/core";
import useVuelidate from "@vuelidate/core";
import { required, minLength, maxLength, helpers } from "@vuelidate/validators";
import { deltaMinLength } from "@/validators";
import slug from "slug";
import _ from "lodash";
import { apiImageClearNonAttached, apiPostStore } from "@/api";

const form = ref({
  title: "",
  slug: "",
  excerpt_raw: new Delta(),
  excerpt_html: "",
  content_raw: new Delta(),
  content_html: "",
  is_published: false,
  image_path: null,
});

const imageList = ref([]);
const tagsList = ref([]);

const postStoreIsCompleted = ref(false);
const newPostId = ref(false);

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const postCreateRules = computed(() => ({
  form: {
    title: { required, minLength: minLength(3), maxLength: maxLength(255) },
    slug: { required, minLength: minLength(3), maxLength: maxLength(100) },
    excerpt_raw: {
      deltaMinLength: helpers.withMessage(
        ({ $response }) => $response?.message || "Invalid Data",
        deltaMinLength(5)
      ),
    },
    content_raw: {
      deltaMinLength: helpers.withMessage(
        ({ $response }) => $response?.message || "Invalid Data",
        deltaMinLength(5)
      ),
    },
  },
}));

const v$ = useVuelidate(
  postCreateRules,
  { form },
  {
    $lazy: true,
    $scope: false,
  }
);

function generateSlug() {
  reloadErrors();
  if (!form.value.title) {
    v$.value.form.title.$touch();
    return false;
  }

  this.form.slug = slug(this.form.title);
}

function storePost() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  v$.value.$validate().then(() => {
    if (v$.value.$invalid) {
      requestProcessing.value = false;
    } else {
      const data = _.cloneDeep(form.value);
      data.excerpt_raw = JSON.stringify(data.excerpt_raw);
      data.content_raw = JSON.stringify(data.content_raw);
      data["image_counter"] = imageList.value.length;
      data["tags"] = JSON.stringify(tagsList.value);

      apiPostStore(data)
        .then((postId) => {
          newPostId.value = postId;
          postStoreIsCompleted.value = true;
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          requestProcessing.value = false;
        });
    }
  });
}

function deleteImageFromList(imageId) {
  imageList.value.splice(
    imageList.value.findIndex((img) => img.id === imageId),
    1
  );
}
function addImageToList(newImage) {
  imageList.value.push(newImage);
}

function updateImageFolder(newFolder) {
  if (!form.value.image_path && newFolder) {
    form.value.image_path = newFolder;
  }
}

function clearNotAttachedImages() {
  if (!postStoreIsCompleted.value && form.value.image_path) {
    // console.log(
    //   `clearNotAttached() -> apiImageClearNonAttached(${form.value.image_path})`
    // );
    apiImageClearNonAttached(
      form.value.image_path,
      imageList.value.length
    ).catch((err) => {
      console.log("failed clearNotAttached(): " + err);
    });
  }
}

onBeforeUnmount(() => {
  clearNotAttachedImages();
});
</script>
