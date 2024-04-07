import { ref } from "vue";

export function useMessage() {
  const refMessage = ref(null);
  const messageDisplay = ref(false);
  const messageText = ref("");
  const messageType = ref("success");
  const messageAutoDisappearing = ref(false);
  const messageIntervalOfDisappearance = ref(5000);

  function messageCreate(
    text,
    type,
    autoDisappearing = false,
    intervalOfDisappearance = false
  ) {
    messageText.value = text;

    if (type) messageType.value = type;
    else messageType.value = "success";

    messageAutoDisappearing.value = Boolean(autoDisappearing);

    if (intervalOfDisappearance)
      messageIntervalOfDisappearance.value = +intervalOfDisappearance;
    else messageIntervalOfDisappearance.value = 5000;

    messageDisplay.value = true;

    if (refMessage.value && refMessage.value instanceof HTMLElement)
      refMessage.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  return {
    refMessage,
    messageDisplay,
    messageText,
    messageType,
    messageAutoDisappearing,
    messageIntervalOfDisappearance,
    messageCreate,
  };
}
