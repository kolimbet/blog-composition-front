<template>
  <div>
    <div class="mb-2 d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Attached images:</h4>

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

    <PostImageAdd
      :is-open="addFormIsOpen"
      :post-id="props.postId"
      :image-folder="props.imageFolder"
      @close="closeAddForm()"
      @add-image="emit('addImage', $event)"
      @update:image-folder="emit('update:imageFolder', $event)"
    />

    <template v-if="props.imageList.length">
      <div class="d-flex flex-wrap gap-0-75rem justify-content-center">
        <TransitionGroup name="list-folding-y-150">
          <PostImageItem
            v-for="image in props.imageList"
            :key="image.id"
            :image="image"
            :clickTrigger="clickImageTrigger"
            @set-click-trigger="setClickImageTrigger(image.id)"
            @delete="emit('deleteImage', image.id)"
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
</template>

<script setup>
import BaseButtonPill from "../base/BaseButtonPill.vue";
import PostImageAdd from "./PostImageAdd.vue";
import PostImageItem from "./PostImageItem.vue";

import { defineEmits, defineProps, ref } from "vue";

const props = defineProps({
  imageList: Array,
  postId: {
    type: [String, Number, null],
    default: null,
  },
  imageFolder: [String, null],
});

const emit = defineEmits(["update:imageFolder", "addImage", "deleteImage"]);

const addFormIsOpen = ref(false);
const clickImageTrigger = ref(0);

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
