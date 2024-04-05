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
