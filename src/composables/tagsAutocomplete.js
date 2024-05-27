import { computed, ref } from "vue";
import {
  tagsIsLoaded,
  tagsNotEmpty,
  tagsSortedAlphabetically,
} from "@/composables/storeTags.js";

export function useTagsAutocomplete() {
  const tagsAutocompleteFilter = ref("");
  const tagsAutocompleteLimit = 12;

  const tagsAutocompleteFilterLowCase = computed(() =>
    tagsAutocompleteFilter.value.toLowerCase()
  );

  const tagsAutocompleteList = computed(() => {
    if (
      tagsAutocompleteFilter.value &&
      tagsIsLoaded.value &&
      tagsNotEmpty.value &&
      tagsSortedAlphabetically.value?.length
    ) {
      return tagsSortedAlphabetically.value
        .filter((tagItem) =>
          tagItem.name_low_case.includes(tagsAutocompleteFilterLowCase.value)
        )
        .sort(
          (tagA, tagB) => {
            const tagAIndex = tagA.name_low_case.indexOf(
              tagsAutocompleteFilterLowCase.value
            );
            const tagBIndex = tagB.name_low_case.indexOf(
              tagsAutocompleteFilterLowCase.value
            );
            if (tagAIndex === tagBIndex) {
              return tagA.name_low_case.localeCompare(tagB.name_low_case);
            } else if (tagAIndex > tagBIndex) {
              return -1;
            } else {
              return 1;
            }
          }
          // tagA.name_low_case.localeCompare(tagB.name_low_case)
        )
        .slice(0, tagsAutocompleteLimit);
    } else {
      return [];
    }
  });

  const tagsAutocompleteHasMatches = computed(
    () => tagsAutocompleteList.value.length
  );

  const tagsAutocompleteFullMatch = computed(() => {
    if (tagsAutocompleteHasMatches.value) {
      return tagsAutocompleteList.value.find(
        (tagItem) =>
          tagItem.name_low_case == tagsAutocompleteFilterLowCase.value
      );
    } else {
      return false;
    }
  });

  const tagsAutocompleteOnlyMatchIsSelected = computed(
    () =>
      tagsAutocompleteFullMatch.value &&
      tagsAutocompleteList.value.length === 1 &&
      tagsAutocompleteFullMatch.value.name == tagsAutocompleteFilter.value
  );

  return {
    tagsAutocompleteFilter,
    tagsAutocompleteList,
    tagsAutocompleteHasMatches,
    tagsAutocompleteFullMatch,
    tagsAutocompleteOnlyMatchIsSelected,
  };
}
