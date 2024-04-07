import { ref } from "vue";

export function useRequest() {
  const refErrorMessage = ref(null);
  const requestProcessing = ref(false);
  const triggerForReloadingErrors = ref(false);
  const errorTrigger = ref(false);
  const errorObject = ref({
    $message: "",
  });

  const setError = (err) => {
    errorObject.value.$message = err;
    errorTrigger.value = true;
    if (refErrorMessage.value && refErrorMessage.value instanceof HTMLElement)
      refErrorMessage.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  const reloadingMessages = () => {
    triggerForReloadingErrors.value = !triggerForReloadingErrors.value;
  };

  const reloadErrors = () => {
    reloadingMessages();
    errorTrigger.value = false;
  };

  return {
    refErrorMessage,
    requestProcessing,
    triggerForReloadingErrors,
    errorTrigger,
    errorObject,
    setError,
    reloadErrors,
  };
}
