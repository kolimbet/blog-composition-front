<template>
  <div>
    <div class="mb-2 d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Tags:</h4>
      <BaseIconUpdate
        @click="requestAvailableTags()"
        :title="'Update available tags list'"
      />
    </div>

    <!-- Request Error -->
    <div ref="refErrorMessage">
      <ErrorSingle
        :is-error="errorTrigger"
        :error-object="errorObject"
        :reload-trigger="triggerForReloadingErrors"
        class="mb-4"
      />
    </div>

    <div v-if="tagsIsLoaded && tagsNotEmpty">
      <div class="mb-3">
        <div
          v-if="props.listOfAttachedTags && props.listOfAttachedTags.length"
          class="d-flex flex-wrap gap-0-75rem"
        >
          <template
            v-for="tagItem in props.listOfAttachedTags"
            :key="tagItem.id"
          >
            <div
              class="px-2 py-1 rounded rounded-2 border border-1 border-blue"
            >
              <span class="me-0-75rem">{{ tagItem.name }}</span>
              <i
                @click="detachTag(tagItem.id)"
                class="fa fa-times link-secondary cursor-pointer"
                aria-hidden="true"
              ></i>
            </div>
          </template>
        </div>
        <div v-else class="text-secondary fs-sm">No tags attached.</div>
      </div>

      <div
        v-if="
          tagsAutocompleteHasMatches && !tagsAutocompleteOnlyMatchIsSelected
        "
        class="d-flex flex-wrap gap-1 p-1 mb-1 rounded-1 bg-white shadow"
      >
        <span
          v-for="autocompleteItem in tagsAutocompleteList"
          :key="autocompleteItem.id"
          @click="selectAutocomplete(autocompleteItem.name)"
          class="d-inline-flex px-2 fs-xs fw-bold bg-secondary bg-opacity-25 rounded-2 cursor-pointer"
          >{{ autocompleteItem.name }}</span
        >
      </div>

      <div
        class="d-flex gap-3 flex-column flex-sm-row justify-content-sm-between align-items-sm-center"
      >
        <div class="d-flex align-items-center">
          <label
            for="tag-attach-to-post"
            class="form-control-sm text-secondary text-nowrap"
            >Tag name</label
          >
          <input
            v-model="tagsAutocompleteFilter"
            id="tag-attach-to-post"
            type="text"
            class="form-control form-control-sm"
          />
        </div>

        <div class="text-center">
          <BaseButtonPill
            @click="attachTag()"
            :text="'Attach'"
            :title="'Attach a tag'"
            class="btn-blue"
          >
            <i class="fa fa-link me-1" aria-hidden="true"></i>
          </BaseButtonPill>
        </div>
      </div>
    </div>
    <div v-else class="text-secondary fs-sm">Failed to load available tags</div>
  </div>
</template>

<script setup>
import BaseIconUpdate from "../base/BaseIconUpdate.vue";
import ErrorSingle from "../inc/ErrorSingle.vue";
import BaseButtonPill from "../base/BaseButtonPill.vue";

import { defineEmits, defineProps, onMounted } from "vue";
import {
  tagsIsLoaded,
  tagsNotEmpty,
  tagsLoading,
  tagsLoadError,
} from "@/composables/storeTags.js";
import { useRequest } from "@/composables/request";
import { useTagsAutocomplete } from "@/composables/tagsAutocomplete";
import { apiTagList } from "@/api";

const props = defineProps({
  listOfAttachedTags: Array,
});
const emit = defineEmits(["update:listOfAttachedTags"]);

const {
  refErrorMessage,
  requestProcessing,
  triggerForReloadingErrors,
  errorTrigger,
  errorObject,
  setError,
  reloadErrors,
} = useRequest();

const {
  tagsAutocompleteFilter,
  tagsAutocompleteList,
  tagsAutocompleteHasMatches,
  tagsAutocompleteFullMatch,
  tagsAutocompleteOnlyMatchIsSelected,
} = useTagsAutocomplete();

function requestAvailableTags() {
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

function selectAutocomplete(selectName) {
  tagsAutocompleteFilter.value = selectName;
}

function attachTag() {
  if (!tagsAutocompleteFilter.value) return;
  reloadErrors();

  if (!tagsAutocompleteFullMatch.value) {
    setError("No tag with that name was found");
    return;
  }

  if (
    props.listOfAttachedTags.length &&
    props.listOfAttachedTags.find(
      (tag) => tagsAutocompleteFullMatch.value.id == tag.id
    )
  ) {
    setError("This tag has already been attached");
    return;
  }

  const newListOfAttachedTags = props.listOfAttachedTags.slice();
  newListOfAttachedTags.push(tagsAutocompleteFullMatch.value);

  emit("update:listOfAttachedTags", newListOfAttachedTags);
  tagsAutocompleteFilter.value = "";
  return true;
}

function detachTag(tagId) {
  const newListOfAttachedTags = props.listOfAttachedTags.slice();
  newListOfAttachedTags.splice(
    props.listOfAttachedTags.findIndex((tag) => tag.id === tagId),
    1
  );

  emit("update:listOfAttachedTags", newListOfAttachedTags);
}

// watch(
//   () => props.listOfAttachedTags,
//   () => {
//     console.log("update props.listOfAttachedTags", props.listOfAttachedTags);
//   }
// );

onMounted(() => {
  if (!tagsIsLoaded.value && !tagsNotEmpty.value) {
    requestAvailableTags();
  }
});
</script>
