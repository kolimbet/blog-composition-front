<template>
  <div>
    <Transition name="fade">
      <button
        v-if="hasFirstLink"
        @click="goToFirst()"
        type="button"
        class="btn lh-1 btn-blue rounded-pill px-3 py-2 me-2"
        title="First page"
      >
        &laquo;
      </button>
    </Transition>

    <Transition name="fade">
      <button
        v-if="hasPrevLink"
        @click="goToPrev()"
        type="button"
        class="btn lh-1 btn-blue rounded-pill px-3 py-2"
        title="Previous page"
      >
        Prev
      </button>
    </Transition>

    <span class="px-3 py-2 text-blue-dark"
      >page: <strong>{{ props.page }}</strong> / {{ props.totalPages }}</span
    >

    <Transition name="fade">
      <button
        v-if="hasNextLink"
        @click="goToNext()"
        type="button"
        class="btn lh-1 btn-blue rounded-pill px-3 py-2"
        title="Next page"
      >
        Next
      </button>
    </Transition>

    <Transition name="fade">
      <button
        v-if="hasLastLink"
        @click="goToLast()"
        type="button"
        class="btn lh-1 btn-blue rounded-pill px-3 py-2 ms-2"
        title="Last page"
      >
        &raquo;
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { computed, defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  page: Number,
  totalPages: {
    type: Number,
    default: 1,
  },
  links: Object,
  routePath: { type: String, default: "" },
});

const router = useRouter();

const hasFirstLink = computed(() => props.page > 2);
const hasPrevLink = computed(() => props.page > 1);
const hasNextLink = computed(() => props.page < props.totalPages);
const hasLastLink = computed(() => props.page + 1 < props.totalPages);

function generateLink(paginationLink) {
  return props.routePath ? props.routePath + paginationLink : paginationLink;
}

function goToFirst() {
  router.push(generateLink(props.links.first));
}
function goToPrev() {
  router.push(generateLink(props.links.prev));
}
function goToNext() {
  router.push(generateLink(props.links.next));
}
function goToLast() {
  router.push(generateLink(props.links.last));
}
</script>
