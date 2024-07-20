<template>
  <section ref="refEditor"></section>
</template>

<script setup>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

import Quill from "quill";
import { Delta } from "quill/core";
import { defineEmits, defineProps, onMounted, ref, watch } from "vue";
import _ from "lodash";

Quill.prototype.getHtml = function () {
  return this.container.querySelector(".ql-editor").innerHTML;
};

/**
 * @type {RefImpl} refEditor
 * @type {HTMLElement|null} refEditor.value
 */
const refEditor = ref(null);

const props = defineProps({
  content: {
    type: Delta,
    default: new Delta(),
  },
  placeholder: {
    type: String,
    default: "Content",
  },
});

const emit = defineEmits([
  "ready",
  // "change",
  // "input",
  // "blur",
  // "focus",
  "update:content",
  "update:html",
]);

/** @type {Quill|null} */
let editor = null;

/** @type {Delta} */
let content = new Delta();

const options = {
  // theme: "bubble",
  theme: "snow",
  // boundary: document.body,
  modules: {
    toolbar: [
      [{ header: [2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "clean"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      ["blockquote", "code-block"],
      ["link"],
    ],
  },
  placeholder: props.placeholder,
  readOnly: false,
};

function initialize() {
  if (refEditor.value) {
    editor = new Quill(refEditor.value, options);
    contentSettingHandler();

    editor.on("text-change", (/* delta, oldDelta, source */) => {
      // console.log("Event text-change: " + source);
      contentUpdateHandler();
    });

    emit("ready");
  }
}

function contentSettingHandler() {
  if (!_.isEqual(content, props.content)) {
    content = props.content;
    editor.setContents(props.content);
    getHTML();
  }
}

watch(
  () => props.content,
  () => {
    contentSettingHandler();
  }
);

function contentUpdateHandler() {
  const newContent = editor.getContents();
  if (!_.isEqual(content, newContent)) {
    content = newContent;
    emit("update:content", newContent);
    getHTML();
  }
}

function getHTML() {
  let html = editor.getSemanticHTML();
  emit("update:html", html);
}

onMounted(() => {
  initialize();
});
</script>
