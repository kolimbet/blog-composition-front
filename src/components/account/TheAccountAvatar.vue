<template>
  <div>
    <h3 class="text-center">Avatar</h3>
    <div class="min-vh-50">
      <div
        class="pb-0-75rem mb-0-75rem border border-2 border-blue border-top-0 border-start-0 border-end-0 text-center"
      >
        <img
          :src="getAvatarUrl"
          alt="Current avatar"
          class="w-32 mx-auto mb-1 shadow"
        />
        <div class="text-center">
          <template v-if="getAvatarId">
            <button
              @click="deleteAvatar()"
              type="submit"
              class="w-32 p-px mt-px mx-auto d-flex justify-content-center align-items-center rounded-md border border-secondary border-red-hover border-opacity-75 bg-secondary bg-red-hover rounded-2 text-white cursor-pointer"
            >
              <i class="fa fa-times-circle me-1" aria-hidden="true"></i>
              {{ requestProcessing ? "Wait..." : "Delete" }}
            </button>
          </template>
          <template v-else>
            <span
              >The avatar is not installed.<br />
              Double-click on any of the uploaded images to select it.</span
            >
          </template>
        </div>
      </div>

      <div class="mb-2 d-flex justify-content-between align-items-center">
        <BaseIconUpdate @click="requestImages()" class="float-start p-1 me-2" />

        <Transition name="fade" mode="out-in">
          <BaseButtonPill
            v-if="addFormIsOpen"
            @click="toggleAddForm()"
            :text="'Close'"
            :title="'Close the add form'"
            class="btn-red"
          >
            <i class="fa fa-times-circle me-1" aria-hidden="true"></i>
          </BaseButtonPill>
          <BaseButtonPill
            v-else
            @click="toggleAddForm()"
            :text="'Add'"
            :title="'Open the add form'"
            class="btn-green"
          >
            <i class="fa fa-plus-circle me-1" aria-hidden="true"></i>
          </BaseButtonPill>
        </Transition>
      </div>

      <AvatarAdd
        :is-open="addFormIsOpen"
        @close="closeAddForm()"
        @add-image="addImageToList($event)"
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

      <template v-if="imageList.length">
        <div class="d-flex flex-wrap gap-0-75rem justify-content-center">
          <TransitionGroup name="list-folding-y-150">
            <AvatarItem
              v-for="image in imageList"
              :key="image.id"
              :image="image"
              :clickTrigger="clickImageTrigger"
              @set-click-trigger="setClickImageTrigger(image.id)"
              @delete="deleteImageFromList(image.id)"
            />
          </TransitionGroup>
        </div>
      </template>
      <template v-else>
        <div class="mb-2 text-center">
          Images not found. Click on the Add button to open the upload form.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import AvatarItem from "../image/AvatarItem.vue";
import AvatarAdd from "../image/AvatarAdd.vue";
import BaseIconUpdate from "../base/BaseIconUpdate.vue";
import BaseButtonPill from "../base/BaseButtonPill.vue";

import { onMounted, ref } from "vue";
import {
  getAvatarId,
  getAvatarUrl,
  actionAvatarDelete,
} from "@/composables/storeAuth";
import { useRequest } from "@/composables/request";
import { apiAvatarList } from "@/api";

const imageList = ref([]);
const addFormIsOpen = ref(false);
const clickImageTrigger = ref(0);

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

function deleteAvatar() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  actionAvatarDelete()
    .catch((err) => {
      setError(err);
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}

function requestImages() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiAvatarList()
    .then((images) => {
      imageList.value = images;
    })
    .catch((err) => {
      setError(err);
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}
onMounted(() => {
  requestImages();
});

function deleteImageFromList(imageId) {
  imageList.value.splice(
    imageList.value.findIndex((img) => img.id === imageId),
    1
  );
}

function addImageToList(newImage) {
  imageList.value.push(newImage);
}

function setClickImageTrigger(imageId) {
  clickImageTrigger.value = imageId;
}

function toggleAddForm() {
  addFormIsOpen.value = !addFormIsOpen.value;
}
function closeAddForm() {
  addFormIsOpen.value = false;
}
</script>
