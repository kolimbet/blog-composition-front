<template>
  <Transition name="slide-left" mode="out-in">
    <div
      v-if="props.display"
      class="mt-1 px-3 py-2 rounded-2 border border-opacity-50 text-center"
      :class="[cardClasses]"
    >
      <span>{{ props.message }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  message: String,
  messageType: {
    type: String,
    default: "success",
  },
  display: Boolean,
});

const cardClasses = computed(() => {
  switch (props.messageType) {
    case "warning":
      return "border-red bg-red-light text-red-dark";
    case "info":
      return "border-primary bg-blue-light text-blue-dark";
    case "secondary":
      return "border-secondary bg-gray-200 text-gray-700";
    case "success":
    default:
      return "border-green bg-green-light text-green-dark";
  }
});
</script>
