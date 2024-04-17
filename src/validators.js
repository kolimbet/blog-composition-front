import { helpers } from "@vuelidate/validators";
import { Delta } from "quill/core";

export function notSameAs(param) {
  return helpers.withParams({ type: "notSameAs", value: param }, (value) => {
    // console.log("validator notSameAs", value, param);
    if (value !== param) return true;
    else return false;
  });
}

export function deltaMinLength(param) {
  return helpers.withParams(
    { type: "deltaMinLength", value: param },
    (value) => {
      // console.log("validator deltaMinLength", value, param);
      let result = {
        $valid: false,
        message: "Error",
      };

      if (!(value instanceof Delta)) {
        result.message = "The value type must be Delta";
        return result;
      }

      if (!value.ops.length) {
        result.message = "Value is required";
        return result;
      }

      let fullText = "";
      value.ops.forEach((elt) => (fullText += elt.insert.replace(/\n/g, "")));

      if (fullText.length < param) {
        result.message = `The text must be at least ${param} characters long`;
        return result;
      } else {
        result.$valid = true;
        return result;
      }
    }
  );
}

function checkImageSize(image, maxSizeKB = 1024) {
  const maxSizeB = maxSizeKB * 1024;
  const result = {
    $valid: false,
    message: `The file size should not exceed ${maxSizeKB} kB`,
  };

  if (image.size <= maxSizeB) result.$valid = true;

  return result;
}

function checkImageType(image) {
  const acceptableTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    // "image/gif",
  ];
  const result = {
    $valid: false,
    message: "Acceptable image types: jpeg, png, webp",
  };

  if (acceptableTypes.includes(image.type)) result.$valid = true;

  return result;
}

export const validateImageToAvatar = (value) => {
  let result = {
    $valid: false,
    message: "",
  };

  // console.log("validateImageToAvatar", value);
  if (value === undefined || value === "" || !value) {
    result.message = "The file is not selected";
    return result;
  }

  const sizeCheck = checkImageSize(value);
  if (!sizeCheck.$valid) return sizeCheck;

  const typeCheck = checkImageType(value);
  if (!typeCheck.$valid) return typeCheck;

  result.$valid = true;
  return result;
};
