import { computed, ref } from "vue";

const tagsList = ref([]);
export const tagsIsLoaded = ref(false);

export const tagsNotEmpty = computed(() => tagsList.value?.length ?? false);

export const tagsSortedAlphabetically = computed(() => {
  if (tagsNotEmpty.value) {
    return tagsList.value
      .slice()
      .sort((tagA, tagB) =>
        tagA.name_low_case.localeCompare(tagB.name_low_case)
      );
  } else {
    return tagsList.value;
  }
});

export function tagsLoading(tags) {
  tagsList.value = tags;
  tagsIsLoaded.value = true;
}

export function tagsLoadError() {
  tagsIsLoaded.value = false;
  tagsList.value = [];
}

export function tagAdd(newTag) {
  tagsList.value.push(newTag);
}

export function tagUpdate(changedTag) {
  tagsList.value.splice(
    tagsList.value.findIndex((tag) => tag.id === changedTag.id),
    1,
    changedTag
  );
}

export function tagDelete(tagId) {
  tagsList.value.splice(
    tagsList.value.findIndex((tag) => tag.id === tagId),
    1
  );
}
