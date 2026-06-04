export interface Field {
  required?: true;
  description?: string;
}

export interface NumberField extends Field {
  type: "number";
  min?: number;
  default?: number;
  max?: number;
  integer?: boolean;
}

export interface StringField extends Field {
  type: "string";
  default?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface BooleanField extends Field {
  type: "boolean";
  default?: boolean;
  truthy?: string[];
  falsy?: string[];
}

export interface EnumField extends Field {
  type: "enum";
  values: readonly string[];
  default?: string;
}

export interface UrlField extends Field {
  type: "url";
  default?: string;
  protocols?: string[];
}

export interface EmailField extends Field {
  type: "email";
  default?: string;
}

export type FieldSpec =
  | NumberField
  | StringField
  | BooleanField
  | EnumField
  | UrlField
  | EmailField;

export type EnvSchema = Record<string, FieldSpec>;

export interface Options {
  env?: Record<string, string>;
  onError?: "return" | "throw";
}

export interface FieldError {
  variable: string;
  message: string;
  description?: string;
  received?: string;
}

export interface ValidationResult {
  success: boolean;
  data: Record<string, unknown>;
  errors: FieldError[];
}
