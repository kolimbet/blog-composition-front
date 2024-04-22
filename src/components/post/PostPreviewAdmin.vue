<template>
  <div class="post-preview" :class="[classesOfCard]">
    <div class="label-id" :class="[classesOfLabel]">#{{ props.post.id }}</div>

    <div class="label-edit" :class="[classesOfLabel]">
      <RouterLink
        :to="{
          name: 'post_edit',
          params: { postId: props.post.id },
        }"
        class="fs-5 link-white text-decoration-none"
        title="Edit"
      >
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
      </RouterLink>
    </div>

    <div class="post-title">
      <span>{{ props.post.title }}</span>
      <span class="ms-1 link-secondary">
        <Transition name="fade" mode="out-in">
          <i
            v-if="showExcerpt"
            @click="toggleExcerpt()"
            class="fa fa-chevron-circle-up cursor-pointer"
            title="Close Preview"
          ></i>
          <i
            v-else
            @click="toggleExcerpt()"
            class="fa fa-chevron-circle-down cursor-pointer"
            title="Open Preview"
          ></i>
        </Transition>
      </span>
    </div>

    <Transition name="folding-y-300" mode="out-in">
      <div
        v-if="showExcerpt"
        v-html="props.post.excerpt_html"
        class="post-excerpt ql-output"
      ></div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, defineProps, ref } from "vue";

const props = defineProps({
  post: Object,
});

const showExcerpt = ref(false);

const classesOfCard = computed(() =>
  props.post.is_published ? "border-blue" : "border-secondary"
);
const classesOfLabel = computed(() =>
  props.post.is_published ? "bg-blue" : "bg-secondary"
);

function toggleExcerpt() {
  showExcerpt.value = !showExcerpt.value;
}
</script>
