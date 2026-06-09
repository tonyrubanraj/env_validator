import { formatErrors } from "./formatter.js";
import type {
  EnvSchema,
  Options,
  ValidationResult,
  FieldError,
} from "./schema.js";
import { runValidator } from "./validator.js";

const isEmpty = (val: string | undefined): boolean => {
  return val === undefined || val === "";
};

export const validate = (
  schema: EnvSchema,
  options?: Options,
): ValidationResult => {
  const values = options?.env ?? process.env;
  const errors: FieldError[] = [];
  const data: Record<string, unknown> = {};
  Object.keys(schema).forEach((key) => {
    const config = schema[key];
    if (!config) return;
    const value = values[key];
    if (isEmpty(value)) {
      if (config.default !== undefined) {
        data[key] = config.default;
        return;
      }
      if (config.required) {
        errors.push({
          variable: key,
          description: config.description,
          message: `value is required but missing`,
          received: value,
        });
      }
      return;
    }
    const result = runValidator(value as string, config);
    if (result.ok) {
      data[key] = result.value;
    } else {
      errors.push({
        variable: key,
        description: config.description,
        message: result.message,
        received: value,
      });
    }
  });
  if (options?.onError !== "return" && errors.length > 0)
    throw new Error(formatErrors(errors));
  return {
    success: errors.length === 0,
    data,
    errors,
  };
};
