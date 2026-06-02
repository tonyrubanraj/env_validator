interface Field {
  required?: true;
  description?: string;
}

interface NumberField extends Field {
  type: "number";
  min?: number;
  default?: number;
  max?: number;
  integer?: boolean;
}

interface StringField extends Field {
  type: "string";
  default?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

interface BooleanField extends Field {
  type: "boolean";
  default?: boolean;
  truthy?: string[];
  falsy?: string[];
}

interface EnumField extends Field {
  type: "enum";
  values: readonly string[];
  default?: string;
}

interface UrlField extends Field {
  type: "url";
  default?: string;
  protocols?: string[];
}

interface EmailField extends Field {
  type: "email";
  default?: string;
}

type FieldSpec =
  | NumberField
  | StringField
  | BooleanField
  | EnumField
  | UrlField
  | EmailField;

type EnvSchema = Record<string, FieldSpec>;
