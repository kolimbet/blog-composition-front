<template>
  <div ref="refImageBlock" class="position-relative">
    <!-- Request Error -->
    <ErrorSingle
      :is-error="errorTrigger"
      :error-object="errorObject"
      :reload-trigger="triggerForReloadingErrors"
      class="position-absolute z-2 top-n8"
      :class="[
        errorLeftPositionClass,
        errorRightPositionClass,
        errorWidthClass,
      ]"
    />

    <div
      @click="clickImage()"
      class="mx-auto box-content d-flex justify-content-center align-items-center border p-px"
      :class="[borderColorClass, bgColorClass]"
    >
      <img :src="image.full_url" class="mh-32 mw-7xl" />
    </div>

    <div
      @click="copyImageLink()"
      class="copy-image-link link-white bg-secondary bg-green-hover"
    >
      <i class="fa fa-link" aria-hidden="true"></i>
    </div>

    <Transition name="folding-y-50">
      <div
        v-if="isClicked"
        class="border-top border-transparent position-absolute bottom-n3 start-0 end-0"
      >
        <button
          @click="deleteImage()"
          class="py-0 px-1 mx-auto d-flex justify-content-center align-items-center rounded-md border border-secondary border-red-hover border-opacity-75 bg-secondary bg-red-hover rounded-2 fs-sm text-white cursor-pointer"
        >
          <i class="fa fa-times-circle me-1" aria-hidden="true"></i>
          {{ requestProcessing ? "Wait" : "Delete" }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";

import {
  computed,
  defineEmits,
  defineProps,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useRequest } from "@/composables/request";
import { apiImageDelete } from "@/api";
import { copyTextToClipboard } from "@/service-functions";

const props = defineProps({
  image: Object,
  clickTrigger: Number,
});
const emit = defineEmits(["setClickTrigger", "delete"]);

const refImageBlock = ref(null);

const isClicked = ref(false);
const blockPosition = ref(null);

const {
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const leftLimitation = computed(() =>
  blockPosition.value ? blockPosition.value.left < 80 : true
);
const rigthLimitation = computed(() =>
  blockPosition.value
    ? window.innerWidth - blockPosition.value.right < 80
    : true
);

const errorLeftPositionClass = computed(() =>
  leftLimitation.value ? "start-n2" : "start-n20"
);
const errorRightPositionClass = computed(() =>
  rigthLimitation.value ? "end-n2" : "end-n20"
);
const errorWidthClass = computed(() => {
  if (!leftLimitation.value && !rigthLimitation.value) return "w-72";
  else if (leftLimitation.value && rigthLimitation.value) return "w-36";
  else return "w-56";
});

const borderColorClass = computed(() =>
  isClicked.value
    ? "bg-blue-light bg-blue-200-hover"
    : "bg-transparent bg-blue-light-hover"
);

const bgColorClass = computed(() =>
  isClicked.value
    ? "border-blue-light border-blue-300-hover"
    : "border-transparent border-blue-200-hover"
);

function clickImage() {
  emit("setClickTrigger");
}

function deleteImage() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiImageDelete(props.image.id)
    .then(() => {
      emit("delete");
    })
    .catch((err) => {
      setError(err);
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}

function copyImageLink() {
  copyTextToClipboard(props.image.full_url);
}

function setBlockPosition() {
  if (errorTrigger.value)
    blockPosition.value = refImageBlock.value.getBoundingClientRect();
}

watch(
  () => props.clickTrigger,
  (clikedId) => {
    if (clikedId === props.image.id) isClicked.value = true;
    else {
      isClicked.value = false;
      reloadErrors();
    }
  }
);

watch(errorTrigger, (newValue) => {
  if (newValue) setBlockPosition();
});

onMounted(() => {
  window.addEventListener("resize", setBlockPosition);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", setBlockPosition);
});
</script>
