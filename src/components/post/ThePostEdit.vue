<template>
  <div>
    <h3 class="text-center">Editing a post #{{ props.postId }}</h3>

    <div class="mb-3 d-flex justify-content-between">
      <div class="fs-sm text-secondary">
        <div><span class="me-2">Created:</span> {{ createdAt }}</div>
        <div v-if="updatedAt" class="mt-1">
          <span class="me-2">Updated:</span> {{ updatedAt }}
        </div>
      </div>

      <BaseIconUpdate @click="refreshPostData()" :title="'Refresh post data'" />
    </div>

    <div ref="refMessage">
      <InfoMessage
        v-model:display="messageDisplay"
        :message="messageText"
        :message-type="messageType"
        class="mb-4"
      />
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

    <Transition name="folding-y-1000" mode="out-in">
      <div v-if="postData">
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

        <div
          class="mb-4 d-flex justify-content-between align-items-baseline gap-2"
        >
          <div class="form-check">
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

          <div v-if="publishedAt" class="fs-sm text-secondary">
            <span class="me-2">Published:</span> {{ publishedAt }}
          </div>
        </div>

        <TheTagListOfPost
          v-model:list-of-attached-tags="tagsList"
          class="mb-4"
        />

        <ThePostImageList
          :post-id="props.postId"
          :image-folder="form.image_path"
          @update:image-folder="updateImageFolder($event)"
          :image-list="imageList"
          @add-image="addImageToList($event)"
          @delete-image="deleteImageFromList($event)"
          class="mb-4"
        />

        <div class="mb-4">
          <BaseRequestButton
            @click="updatePost()"
            :text="'Update'"
            :processing="requestProcessing"
          />
        </div>
        <div class="mb-4">
          <BaseRequestButton
            @click="deletePost()"
            :text="'Delete'"
            :processing="requestProcessing"
            :role="'delete'"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import InfoMessage from "../inc/InfoMessage.vue";
import ErrorSingle from "../inc/ErrorSingle.vue";
import ErrorList from "../inc/ErrorList.vue";
import BaseRequestButton from "../base/BaseRequestButton.vue";
import EditorPost from "../quill/EditorPost.vue";
import BaseIconUpdate from "../base/BaseIconUpdate.vue";
import ThePostImageList from "../image/ThePostImageList.vue";
import TheTagListOfPost from "../tag/TheTagListOfPost.vue";

import { computed, defineProps, onMounted, ref } from "vue";
import { Delta } from "quill/core";
import { useRequest } from "@/composables/request";
import useVuelidate from "@vuelidate/core";
import { required, minLength, maxLength, helpers } from "@vuelidate/validators";
import { deltaMinLength } from "@/validators";
import slug from "slug";
import { apiPostDelete, apiPostItemAdmin, apiPostUpdate } from "@/api";
import _ from "lodash";
import { dateFromTimestamp } from "@/service-functions";
import { useMessage } from "@/composables/message";
import { useRouter } from "vue-router";

const props = defineProps({
  postId: [Number, String],
});

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

const postData = ref(null);

/**
 * @type {HTMLElement|null} refMessage.value
 */
const { refMessage, messageDisplay, messageText, messageType, messageCreate } =
  useMessage();

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const router = useRouter();

const postUpdateRules = computed(() => ({
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
  postUpdateRules,
  { form },
  {
    $lazy: true,
    $scope: false,
  }
);

const createdAt = computed(() =>
  postData.value?.created_at ? dateFromTimestamp(postData.value.created_at) : ""
);

const updatedAt = computed(() =>
  postData.value?.updated_at &&
  postData.value.updated_at != postData.value.created_at
    ? dateFromTimestamp(postData.value.updated_at)
    : ""
);

const publishedAt = computed(() =>
  form.value.is_published && postData.value?.published_at
    ? dateFromTimestamp(postData.value.published_at)
    : ""
);

function generateSlug() {
  reloadErrors();
  if (!form.value.title) {
    v$.value.form.title.$touch();
    return false;
  }

  this.form.slug = slug(this.form.title);
}

function loadPostData({ post, images }) {
  post.excerpt_raw = new Delta(JSON.parse(post.excerpt_raw));
  post.content_raw = new Delta(JSON.parse(post.content_raw));
  post.is_published = Boolean(post.is_published);
  postData.value = _.cloneDeep(post);

  for (let key in form.value) {
    form.value[key] = post[key];
  }
  tagsList.value = post["tags"] ?? [];

  imageList.value = images ?? [];
}

function requestPostData(successFunc = null) {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiPostItemAdmin(props.postId)
    .then((data) => {
      loadPostData(data);
      if (successFunc) successFunc();
    })
    .catch((err) => {
      setError(err);
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}

function refreshPostData() {
  requestPostData(() => {
    messageCreate("Data has been successfully refreshed", "secondary", true);
  });
}

function updatePost() {
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
      data["tags"] = JSON.stringify(tagsList.value);

      apiPostUpdate(props.postId, data)
        .then((postNewData) => {
          loadPostData(postNewData);
          messageCreate(
            "Updating post completed successfully",
            "success",
            true
          );
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

function deletePost() {
  if (confirm("Are you sure you want to delete the post&")) {
    if (requestProcessing.value) return;
    requestProcessing.value = true;
    reloadErrors();

    apiPostDelete(props.postId)
      .then(() => {
        postData.value = null;

        messageCreate(
          `Post #${props.postId} has been successfully deleted`,
          "success"
        );
        refMessage.value.addEventListener(
          "click",
          () => {
            router.push({ name: "admin_posts" });
          },
          { once: true }
        );
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        requestProcessing.value = false;
      });
  }
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

onMounted(() => {
  requestPostData();
});
</script>
