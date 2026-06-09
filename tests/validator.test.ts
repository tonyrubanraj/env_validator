import { runValidator } from "../src/validator.js";

describe("runValidator - number field", () => {
  it("returns ok:false for a non-numeric string", () => {
    const result = runValidator("abc", { type: "number" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("must be a number");
  });
  it("returns ok:true for a numeric string", () => {
    const result = runValidator("123", { type: "number" });
    expect(result.ok).toBe(true);
  });
  it("returns ok:false when the input is > than max", () => {
    const result = runValidator("35", { type: "number", max: 20 });
    expect(result.ok).toBe(false);
  });
  it("returns ok:true when the input is <= max", () => {
    const result = runValidator("15", { type: "number", max: 20 });
    expect(result.ok).toBe(true);
  });
  it("returns ok:false when the input is < than min", () => {
    const result = runValidator("15", { type: "number", min: 20 });
    expect(result.ok).toBe(false);
  });
  it("returns ok:true when the input is >= min", () => {
    const result = runValidator("15", { type: "number", min: 10 });
    expect(result.ok).toBe(true);
  });
  it("returns ok:false for a non-integer when integer is required", () => {
    const result = runValidator("3.14", { type: "number", integer: true });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("must be an integer");
  });
  it("returns ok:true for an integer when integer is required", () => {
    const result = runValidator("42", { type: "number", integer: true });
    expect(result.ok).toBe(true);
  });
});

describe("runValidator - string field", () => {
  it("returns ok:true for a plain string", () => {
    const result = runValidator("hello", { type: "string" });
    expect(result.ok).toBe(true);
  });
  it("returns ok:false when value does not match pattern", () => {
    const result = runValidator("abc", { type: "string", pattern: /^\d+$/ });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("pattern");
  });
  it("returns ok:true when value matches pattern", () => {
    const result = runValidator("123", { type: "string", pattern: /^\d+$/ });
    expect(result.ok).toBe(true);
  });
  it("returns ok:false when value is shorter than minLength", () => {
    const result = runValidator("hi", { type: "string", minLength: 5 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(">=");
  });
  it("returns ok:true when value meets minLength", () => {
    const result = runValidator("hello", { type: "string", minLength: 5 });
    expect(result.ok).toBe(true);
  });
  it("returns ok:false when value exceeds maxLength", () => {
    const result = runValidator("toolongstring", {
      type: "string",
      maxLength: 5,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("<=");
  });
  it("returns ok:true when value is within maxLength", () => {
    const result = runValidator("hi", { type: "string", maxLength: 5 });
    expect(result.ok).toBe(true);
  });
});

describe("runValidator - boolean field", () => {
  test.each(["true", "1", "yes", "on", "enabled"])(
    'returns ok:true for truthy value "%s"',
    (value) => {
      const result = runValidator(value, { type: "boolean" });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(true);
    },
  );

  test.each(["false", "0", "no", "off", "disabled"])(
    'returns ok:true for falsy value "%s"',
    (value) => {
      const result = runValidator(value, { type: "boolean" });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(false);
    },
  );
  it("returns ok:false for an unrecognised value", () => {
    const result = runValidator("maybe", { type: "boolean" });
    expect(result.ok).toBe(false);
  });
  it("returns ok:true for a custom truthy value", () => {
    const result = runValidator("yep", { type: "boolean", truthy: ["yep"] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(true);
  });
  it("returns ok:true for a custom falsy value", () => {
    const result = runValidator("nope", { type: "boolean", falsy: ["nope"] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(false);
  });
});

describe("runValidator - enum field", () => {
  const spec = { type: "enum", values: ["small", "medium", "large"] } as const;

  it("returns ok:true for a value in the enum", () => {
    const result = runValidator("medium", spec);
    expect(result.ok).toBe(true);
  });
  it("returns ok:false for a value not in the enum", () => {
    const result = runValidator("xlarge", spec);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("must be one of");
  });
});

describe("runValidator - url field", () => {
  it("returns ok:false for an invalid URL", () => {
    const result = runValidator("not-a-url", { type: "url" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("invalid url");
  });
  it("returns ok:true for a valid URL", () => {
    const result = runValidator("https://example.com", { type: "url" });
    expect(result.ok).toBe(true);
  });
  it("returns ok:false when URL protocol is not allowed", () => {
    const result = runValidator("ftp://example.com", {
      type: "url",
      protocols: ["https:"],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("protocol");
  });
  it("returns ok:true when URL protocol is allowed", () => {
    const result = runValidator("https://example.com", {
      type: "url",
      protocols: ["https:"],
    });
    expect(result.ok).toBe(true);
  });
});

describe("runValidator - email field", () => {
  it("returns ok:false for an invalid email", () => {
    const result = runValidator("not-an-email", { type: "email" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch("invalid email");
  });
  it("returns ok:true for a valid email", () => {
    const result = runValidator("user@example.com", { type: "email" });
    expect(result.ok).toBe(true);
  });
});
