<template>
  <div :id="blockId" class="comment" :class="[commentBg, commentShadow]">
    <div class="label-id">#{{ props.comment.id }}</div>

    <aside class="d-flex align-items-center mb-2">
      <img :src="authorAvatarURL" alt="Avatar" class="comment-avatar" />
      <div>
        <h6>{{ props.comment.author.name }}</h6>
        <div class="text-secondary fs-sm">
          <i class="fa fa-clock-o me-1" aria-hidden="true"></i
          ><span>{{ publishedAt }}</span>
        </div>
      </div>
    </aside>

    <div v-html="props.comment.text_html" class="ql-output"></div>

    <div v-if="isOwn && !readOnly" class="d-flex justify-content-between">
      <div class="d-flex align-items-center cursor-pointer link-secondary">
        <!-- <i class="fa fa-heart-o fs-5" aria-hidden="true"></i
        ><span class="ms-1">---</span> -->
        <!-- <i class="fa fa-heart-o fs-5 link-red fw-bold" aria-hidden="true"></i
        ><span class="ms-1">-</span> -->
      </div>

      <div
        class="d-flex align-items-center link-secondary cursor-pointer gap-3"
      >
        <!-- <template v-if="isOwn"> -->
          <i
            @click="confirmationOfDeletion()"
            class="fa fa-trash-o fs-5"
            aria-hidden="true"
            title="Delete a comment"
          ></i>
        <!-- </template> -->

        <!-- <div>
          <i class="fa fa-comment-o fs-5" aria-hidden="true"></i
          ><span class="ms-1">Comment</span>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { dateFromTimestamp } from "@/service-functions";
import { computed, defineEmits, defineProps } from "vue";
import { getUserId } from "@/composables/storeAuth";

const props = defineProps({
  comment: Object,
  readOnly: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["delete"]);

const blockId = computed(() => "comment-" + props.comment.id);

const authorAvatarURL = computed(() =>
  props.comment?.author?.avatar
    ? props.comment.author.avatar.full_url
    : "/images/default_avatar.png"
);
const isOwn = computed(() =>
  getUserId.value && getUserId.value === props.comment.author.id ? true : false
);

const publishedAt = computed(() =>
  props.comment.published_at
    ? dateFromTimestamp(props.comment.published_at)
    : "on moderation"
);

const commentBg = computed(() =>
  props.comment.is_published ? "" : "bg-light"
);
const commentShadow = computed(() =>
  isOwn.value ? "comment-own-shadow" : "comment-shadow"
);

function confirmationOfDeletion() {
  if (confirm("Are you sure you want to delete the comment?")) emit("delete");
}
</script>
