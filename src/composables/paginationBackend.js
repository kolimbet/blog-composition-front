import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export function usePaginationBackend() {
  const paginationParams = ref(null);
  const paginationRawLinks = ref(null);

  const route = useRoute();
  const router = useRouter();

  const paginationPage = computed(() =>
    route.query.page ? +route.query.page : 1
  );
  const paginationTotalPages = computed(() => {
    if (paginationParams.value && paginationParams.value.last_page)
      return +paginationParams.value.last_page;
    else return 1;
  });
  const paginationRoutePath = computed(() => route.path);

  const paginationLinks = computed(() => ({
    first: paginationRawLinks.value?.first_page_url || false,
    prev: paginationRawLinks.value?.prev_page_url || false,
    next: paginationRawLinks.value?.next_page_url || false,
    last: paginationRawLinks.value?.last_page_url || false,
  }));

  function setPaginationParams({ pagination = null, links = null }) {
    paginationParams.value = pagination;
    paginationRawLinks.value = links;
    checkPageRange();
  }

  function checkPageRange() {
    if (
      paginationPage.value > 1 &&
      paginationParams.value?.last_page &&
      paginationPage.value > paginationParams.value.last_page
    ) {
      if (paginationLinks.value.last) {
        router.push(generateLink(paginationLinks.value.last));
      } else {
        router.push(paginationRoutePath);
      }
    } else if (paginationPage.value < 1) {
      router.push(paginationRoutePath);
    }
  }

  function generateLink(paginationLink) {
    return paginationRoutePath.value
      ? paginationRoutePath.value + paginationLink
      : paginationLink;
  }

  return {
    paginationPage,
    paginationTotalPages,
    paginationRoutePath,
    paginationLinks,
    setPaginationParams,
  };
}
