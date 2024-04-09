import { nextTick, ref } from "vue";

export function useMessage() {
  const refMessage = ref(null);
  const messageDisplay = ref(false);
  const messageText = ref("");
  const messageType = ref("success");
  let messageAutoDisappearing = false;
  let messageIntervalOfDisappearance = 5000;
  let disappearancePointer = null;

  function messageCreate(
    text,
    type,
    autoDisappearing = false,
    intervalOfDisappearance = false
  ) {
    if (messageDisplay.value) {
      messageDisplay.value = false;
      clearDisappearancePointer();

      nextTick(() => {
        create(text, type, autoDisappearing, intervalOfDisappearance);
      });
    } else {
      create(text, type, autoDisappearing, intervalOfDisappearance);
    }
  }

  function create(text, type, autoDisappearing, intervalOfDisappearance) {
    messageText.value = text;

    if (type) messageType.value = type;
    else messageType.value = "success";

    messageAutoDisappearing = Boolean(autoDisappearing);

    if (intervalOfDisappearance)
      messageIntervalOfDisappearance = +intervalOfDisappearance;
    else messageIntervalOfDisappearance = 5000;

    if (messageAutoDisappearing) {
      disappearancePointer = setTimeout(() => {
        messageDisplay.value = false;
        disappearancePointer = null;
      }, messageIntervalOfDisappearance);
    }

    messageDisplay.value = true;

    if (refMessage.value && refMessage.value instanceof HTMLElement)
      refMessage.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  function clearDisappearancePointer() {
    if (disappearancePointer) {
      clearTimeout(disappearancePointer);
      disappearancePointer = null;
    }
  }

  return {
    refMessage,
    messageDisplay,
    messageText,
    messageType,
    messageCreate,
  };
}
