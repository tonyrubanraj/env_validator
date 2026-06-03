const TRUTHY_VALUES = new Set<string>(["true", "1", "yes", "on", "enabled"]);
const FALSY_VALUES = new Set<string>(["false", "0", "no", "off", "disabled"]);
const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RuleResult = { ok: true; value: unknown } | { ok: false; message: string };

const validateNumber = (value: string, spec: NumberField): RuleResult => {
  const parsedNumber = Number(value);
  if (Number.isNaN(parsedNumber))
    return {
      ok: false,
      message: `must be a number. Received ${value})`,
    };
  if (spec.integer && !Number.isInteger(parsedNumber))
    return {
      ok: false,
      message: `must be an integer. Received ${parsedNumber}`,
    };
  if (spec.max !== undefined && parsedNumber > spec.max)
    return {
      ok: false,
      message: `must be <= ${spec.max}. Received ${parsedNumber}`,
    };
  if (spec.min !== undefined && parsedNumber < spec.min)
    return {
      ok: false,
      message: `must be >= ${spec.min}. Received ${parsedNumber}`,
    };
  return {
    ok: true,
    value: parsedNumber,
  };
};

const validateString = (value: string, spec: StringField): RuleResult => {
  if (spec.pattern !== undefined && !spec.pattern.test(value))
    return {
      ok: false,
      message: `must be of pattern ${spec.pattern}. Received ${value}`,
    };
  if (spec.minLength !== undefined && value.length < spec.minLength)
    return {
      ok: false,
      message: `must be of length >= ${spec.minLength}. Received string with length ${value.length}`,
    };
  if (spec.maxLength !== undefined && value.length > spec.maxLength)
    return {
      ok: false,
      message: `must be of length <= ${spec.maxLength}. Received string with length ${value.length}`,
    };
  return {
    ok: true,
    value: value,
  };
};

const validateBoolean = (value: string, spec: BooleanField): RuleResult => {
  const truthy =
    spec.truthy && spec.truthy.length
      ? new Set<string>(spec.truthy)
      : TRUTHY_VALUES;
  const falsy =
    spec.falsy && spec.falsy.length
      ? new Set<string>(spec.falsy)
      : FALSY_VALUES;
  if (truthy.has(value))
    return {
      ok: true,
      value: true,
    };
  if (falsy.has(value))
    return {
      ok: true,
      value: false,
    };
  return {
    ok: false,
    message: `must be one of ${[...truthy].join(", ")} or ${[...falsy].join(", ")}`,
  };
};

const validateEnum = (value: string, spec: EnumField): RuleResult => {
  if (spec.default && !spec.values.includes(spec.default))
    return {
      ok: false,
      message: `default must be one of ${spec.values.join(", ")}. Received ${spec.default}`,
    };
  if (!spec.values.includes(value))
    return {
      ok: false,
      message: `must be one of ${spec.values.join(", ")}. Received ${value}`,
    };
  return {
    ok: true,
    value: value,
  };
};

const validateUrl = (value: string, spec: UrlField): RuleResult => {
  if (!URL.canParse(value))
    return {
      ok: false,
      message: `Received an invalid url format`,
    };
  if (spec.default && !URL.canParse(spec.default))
    return {
      ok: false,
      message: `default url is of invalid format`,
    };
  if (spec.protocols && spec.protocols.length) {
    const protocols = new Set<string>(spec.protocols);
    if (spec.default && !protocols.has(new URL(spec.default).protocol))
      return {
        ok: false,
        message: `default url protocol must be ${spec.protocols.join(", ")}. received url with protocol ${new URL(spec.default).protocol}`,
      };
    const parsedUrl = new URL(value);
    if (!protocols.has(parsedUrl.protocol))
      return {
        ok: false,
        message: `must use protocol ${spec.protocols.join(", ")}. received url with protocol ${parsedUrl.protocol}`,
      };
  }
  return {
    ok: true,
    value,
  };
};

const validateEmail = (value: string, spec: EmailField): RuleResult => {
  if (spec.default && !EMAIL_REGEXP.test(spec.default))
    return {
      ok: false,
      message: `default value is in invalid email format`,
    };
  if (!EMAIL_REGEXP.test(value))
    return {
      ok: false,
      message: `received an invalid email format`,
    };
  return {
    ok: true,
    value,
  };
};

const runValidator = (value: string, spec: FieldSpec): RuleResult => {
  switch (spec.type) {
    case "boolean":
      return validateBoolean(value, spec);
    case "email":
      return validateEmail(value, spec);
    case "enum":
      return validateEnum(value, spec);
    case "number":
      return validateNumber(value, spec);
    case "string":
      return validateString(value, spec);
    case "url":
      return validateUrl(value, spec);
  }
};
