<template>
  <button
    type="button"
    class="btn w-percent-100 position-relative px-4"
    :class="[buttonClasses]"
  >
    <div
      class="d-flex align-items-center opacity-90 position-absolute top-0 bottom-0 start-0 ps-2"
    >
      <div v-if="props.processing" class="spinner-border w-5 h-5" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>

      <template v-else>
        <svg
          v-if="props.role == 'delete'"
          class="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4 7H20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M6 10L7.70141 19.3578C7.87432 20.3088 8.70258 21 9.66915 21H14.3308C15.2974 21 16.1257 20.3087 16.2986 19.3578L18 10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <svg
          v-else
          class="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          fill="currentColor"
          version="1.1"
          id="Layer_1"
          viewBox="0 0 297 297"
          xml:space="preserve"
        >
          <g>
            <g>
              <g>
                <path
                  d="M274.556,9.36L7.53,121.792c-8.754,3.686-10.206,15.481-2.607,21.18l49.523,37.142L278.762,15.616     C281.743,12.635,278.441,7.724,274.556,9.36z"
                />
                <path
                  d="M290.875,25.249l-2.358,1.729L106.87,208.626l93.153,62.101c6.749,4.5,15.929,1.35,18.494-6.346l78.273-234.82     C297.974,26.009,293.894,23.035,290.875,25.249z"
                />
                <polygon
                  points="71.92,287.965 129.44,241.619 98.665,221.103    "
                />
                <path
                  d="M89.868,204.51c0.001-0.001,0.002-0.002,0.003-0.003l102.422-102.422c1.609-1.609-0.557-4.133-2.392-2.788     l-128.04,93.895v79.714l26.357-65.892C88.606,206.045,89.175,205.204,89.868,204.51z"
                />
              </g>
            </g>
          </g>
        </svg>
      </template>
    </div>
    <span class="px-0-75rem">{{
      props.processing ? "Please wait" : props.text
    }}</span>
  </button>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  processing: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "Request",
  },
  role: {
    type: String,
    default: "update", // role values ["update", "create", "delete"]
  },
});

const buttonClasses = computed(() => {
  switch (props.role.toLocaleLowerCase()) {
    case "delete":
      return "btn-red";
    case "create":
      return "btn-green";
    case "update":
    default:
      return "btn-blue";
  }
});
</script>
