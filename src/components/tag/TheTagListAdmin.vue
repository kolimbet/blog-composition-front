<template>
  <div class="min-h-50vh">
    <h3 class="text-center">Tags</h3>

    <div class="mb-3 d-flex justify-content-between gap-3">
      <div class="d-flex align-items-center">
        <label for="tags-filter" class="form-control-sm text-secondary"
          >Filter:</label
        >
        <input
          v-model="filter"
          id="tags-filter"
          type="text"
          size="6"
          class="form-control form-control-sm"
        />
      </div>

      <div class="d-flex align-items-center">
        <label
          for="tags-limitOnPage"
          class="form-control-sm text-secondary text-nowrap"
          >On page:</label
        >
        <select
          v-model="limitOnPage"
          id="tags-limitOnPage"
          class="form-select form-select-sm"
        >
          <option
            v-for="limitValue in limitOnPageValues"
            :key="limitValue"
            :value="limitValue"
          >
            {{ limitValue }}
          </option>
        </select>
      </div>
    </div>

    <div class="mb-3 d-flex justify-content-between align-items-center gap-3">
      <BaseIconUpdate @click="requestTags()" />

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
          :title="'Add new one'"
          class="btn-green"
        >
          <i class="fa fa-plus-circle me-1" aria-hidden="true"></i>
        </BaseButtonPill>
      </Transition>
    </div>

    <TheTagCreate
      :is-open="addFormIsOpen"
      @close="closeAddForm()"
      @add="tagAdd($event)"
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

    <div v-if="!tagsIsLoaded" class="mb-2 text-center fs-5 text-secondary">
      Tags are not loaded. Wait...
    </div>
    <div v-else-if="tagsFiltered?.length" class="mt-0">
      <div
        class="mb-0-75rem row row-cols-1 row-cols-lg-2 gx-0-75rem gy-0-75rem"
      >
        <TransitionGroup name="list-folding-y-100">
          <TagItemAdmin
            v-for="tag in tagsPaginated"
            :key="tag.id"
            :tag="tag"
            @update="tagUpdate($event)"
            @delete="tagDelete(tag.id)"
          />
        </TransitionGroup>

        <PaginationLine
          :page="page"
          :totalPages="totalPages"
          :links="paginationLinks"
          :route-path="route.path"
          class="text-center mb-2"
        />
      </div>
    </div>
    <div v-else-if="tagsNotEmpty" class="mb-2 text-center fs-5 text-secondary">
      None of the tags matches the installed filter
    </div>
    <div v-else class="mb-2 text-center fs-5 text-secondary">No tags</div>
  </div>
</template>

<script setup>
import ErrorSingle from "../inc/ErrorSingle.vue";
import BaseIconUpdate from "../base/BaseIconUpdate.vue";
import BaseButtonPill from "../base/BaseButtonPill.vue";
import TheTagCreate from "./TheTagCreate.vue";
import TagItemAdmin from "./TagItemAdmin.vue";
import PaginationLine from "../inc/PaginationLine.vue";

import { computed, onMounted, ref, watch } from "vue";
import {
  tagsIsLoaded,
  tagsNotEmpty,
  tagsSortedAlphabetically,
  tagsLoading,
  tagsLoadError,
  tagAdd,
  tagUpdate,
  tagDelete,
} from "@/composables/storeTags.js";
import { useRoute, useRouter } from "vue-router";
import { useRequest } from "@/composables/request";
import { apiTagList } from "@/api";

const filter = ref("");
const limitOnPage = ref("20");
const limitOnPageValues = [10, 20, 30, 40];
const addFormIsOpen = ref(false);

const route = useRoute();
const router = useRouter();

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const page = computed(() => (route.query.page ? +route.query.page : 1));

const tagsFiltered = computed(() => {
  if (tagsNotEmpty.value) {
    let filterLowCase = filter.value.toLowerCase();
    return tagsSortedAlphabetically.value
      .slice()
      .filter((tag) => tag.name_low_case.includes(filterLowCase));
  } else {
    return tagsSortedAlphabetically.value;
  }
});

const totalPages = computed(() =>
  tagsFiltered.value?.length
    ? Math.ceil(tagsFiltered.value.length / limitOnPage.value)
    : 1
);

const tagsPaginated = computed(() => {
  if (tagsFiltered.value?.length && page.value <= totalPages.value) {
    const start = (page.value - 1) * limitOnPage.value;
    const end = page.value * limitOnPage.value;
    return tagsFiltered.value.slice(start, end);
  } else {
    return [];
  }
});

const paginationLinks = computed(() => ({
  first: "?page=1",
  prev: "?page=" + (page.value - 1),
  next: "?page=" + (page.value + 1),
  last: "?page=" + totalPages.value,
}));

function toggleAddForm() {
  addFormIsOpen.value = !addFormIsOpen.value;
}
function closeAddForm() {
  addFormIsOpen.value = false;
}

function requestTags() {
  if (requestProcessing.value) return;
  requestProcessing.value = true;
  reloadErrors();

  apiTagList()
    .then((tags) => {
      // console.log(tags);
      tagsLoading(tags);
    })
    .catch((err) => {
      setError(err);
      tagsLoadError();
    })
    .finally(() => {
      requestProcessing.value = false;
    });
}

function loadFilterAndLimit() {
  filter.value = localStorage.getItem("tagsFilter") || "";
  limitOnPage.value = localStorage.getItem("tagsLimitOnPage") || 20;
}

watch(filter, (newValue) => {
  localStorage.setItem("tagsFilter", newValue);
});

watch(limitOnPage, (newValue) => {
  localStorage.setItem("tagsLimitOnPage", newValue);
});

watch(
  () => route.query.page,
  (newPageValue) => {
    if (tagsIsLoaded.value && newPageValue > totalPages.value) {
      router.push(route.path + "?page=" + totalPages.value);
    } else if (newPageValue < 1) {
      router.push(route.path);
    }
  }
);

watch(totalPages, (newValue) => {
  if (tagsIsLoaded.value && page.value > newValue)
    router.push(route.path + "?page=" + newValue);
});

onMounted(() => {
  loadFilterAndLimit();
  requestTags();
});
</script>
