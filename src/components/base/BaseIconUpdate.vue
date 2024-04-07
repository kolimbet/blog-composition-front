<template>
  <div
    @click="doRotationAnimation($event)"
    class="cursor-pointer link-blue"
    :title="props.title"
  >
    <i class="fa fa-refresh fs-4" aria-hidden="true"></i>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Update",
  },
});

/** @type { PointerEvent } $event */
function doRotationAnimation($event) {
  /** @type {HTMLElement} elem */
  const elem = $event.currentTarget.querySelector("i");
  if (!elem.classList.contains("rotation-process")) {
    elem.classList.add("rotation-process");
    setTimeout(() => {
      elem.classList.remove("rotation-process");
    }, 2000);
  }
}
</script>
