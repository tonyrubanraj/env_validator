import { validate } from "../src/validate.js";
import type { EnvSchema } from "../src/schema.js";

// Prevent colour codes in thrown error messages during tests
beforeAll(() => {
  process.env["NO_COLOR"] = "1";
});

afterAll(() => {
  delete process.env["NO_COLOR"];
});

// ---------------------------------------------------------------------------
// Default behaviour (onError: "throw")
// ---------------------------------------------------------------------------

describe("validate - throws on error by default", () => {
  it("throws when a required variable is missing", () => {
    const schema: EnvSchema = {
      API_KEY: { type: "string", required: true },
    };
    expect(() => validate(schema, { env: {} })).toThrow();
  });

  it("throws when a value fails validation", () => {
    const schema: EnvSchema = {
      PORT: { type: "number" },
    };
    expect(() => validate(schema, { env: { PORT: "abc" } })).toThrow();
  });

  it("thrown error message includes the variable name", () => {
    const schema: EnvSchema = {
      PORT: { type: "number", required: true, description: "Server port" },
    };
    expect(() => validate(schema, { env: { PORT: "abc" } })).toThrow(/PORT/);
  });
});

// ---------------------------------------------------------------------------
// onError: "return"
// ---------------------------------------------------------------------------

describe("validate - onError: return", () => {
  it("returns success:true and populated data when all fields are valid", () => {
    const schema: EnvSchema = {
      PORT: { type: "number" },
      HOST: { type: "string" },
    };
    const result = validate(schema, {
      env: { PORT: "3000", HOST: "localhost" },
      onError: "return",
    });
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data["PORT"]).toBe(3000);
    expect(result.data["HOST"]).toBe("localhost");
  });

  it("returns success:false with an error when a required variable is missing", () => {
    const schema: EnvSchema = {
      API_KEY: { type: "string", required: true },
    };
    const result = validate(schema, { env: {}, onError: "return" });
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.variable).toBe("API_KEY");
    expect(result.errors[0]?.message).toMatch("required");
  });

  it("returns success:false with an error when a value fails validation", () => {
    const schema: EnvSchema = {
      PORT: { type: "number" },
    };
    const result = validate(schema, {
      env: { PORT: "abc" },
      onError: "return",
    });
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.variable).toBe("PORT");
  });

  it("accumulates errors for multiple invalid fields", () => {
    const schema: EnvSchema = {
      PORT: { type: "number" },
      DEBUG: { type: "boolean" },
    };
    const result = validate(schema, {
      env: { PORT: "abc", DEBUG: "maybe" },
      onError: "return",
    });
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it("does not add a missing optional field to data", () => {
    const schema: EnvSchema = {
      PORT: { type: "number" },
    };
    const result = validate(schema, { env: {}, onError: "return" });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("PORT");
  });
});

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

describe("validate - default values", () => {
  it("uses the default when the variable is missing", () => {
    const schema: EnvSchema = {
      PORT: { type: "number", default: 8080 },
    };
    const result = validate(schema, { env: {}, onError: "return" });
    expect(result.success).toBe(true);
    expect(result.data["PORT"]).toBe(8080);
  });

  it("uses the default when the variable is an empty string", () => {
    const schema: EnvSchema = {
      HOST: { type: "string", default: "localhost" },
    };
    const result = validate(schema, { env: { HOST: "" }, onError: "return" });
    expect(result.success).toBe(true);
    expect(result.data["HOST"]).toBe("localhost");
  });

  it("prefers the provided value over the default", () => {
    const schema: EnvSchema = {
      PORT: { type: "number", default: 8080 },
    };
    const result = validate(schema, {
      env: { PORT: "3000" },
      onError: "return",
    });
    expect(result.success).toBe(true);
    expect(result.data["PORT"]).toBe(3000);
  });
});

// ---------------------------------------------------------------------------
// env option
// ---------------------------------------------------------------------------

describe("validate - env option", () => {
  it("reads from process.env when no env option is provided", () => {
    process.env["TEST_VAR"] = "42";
    const schema: EnvSchema = {
      TEST_VAR: { type: "number" },
    };
    const result = validate(schema, { onError: "return" });
    expect(result.success).toBe(true);
    expect(result.data["TEST_VAR"]).toBe(42);
    delete process.env["TEST_VAR"];
  });

  it("reads from the provided env object instead of process.env", () => {
    process.env["PORT"] = "9999";
    const schema: EnvSchema = {
      PORT: { type: "number" },
    };
    const result = validate(schema, {
      env: { PORT: "1234" },
      onError: "return",
    });
    expect(result.data["PORT"]).toBe(1234);
    delete process.env["PORT"];
  });
});

// ---------------------------------------------------------------------------
// Field type coercion
// ---------------------------------------------------------------------------

describe("validate - field type coercion in data", () => {
  it("coerces a number string to a JS number", () => {
    const schema: EnvSchema = { PORT: { type: "number" } };
    const { data } = validate(schema, {
      env: { PORT: "8080" },
      onError: "return",
    });
    expect(typeof data["PORT"]).toBe("number");
    expect(data["PORT"]).toBe(8080);
  });

  it("coerces a truthy boolean string to true", () => {
    const schema: EnvSchema = { DEBUG: { type: "boolean" } };
    const { data } = validate(schema, {
      env: { DEBUG: "true" },
      onError: "return",
    });
    expect(data["DEBUG"]).toBe(true);
  });

  it("coerces a falsy boolean string to false", () => {
    const schema: EnvSchema = { DEBUG: { type: "boolean" } };
    const { data } = validate(schema, {
      env: { DEBUG: "false" },
      onError: "return",
    });
    expect(data["DEBUG"]).toBe(false);
  });

  it("keeps a valid URL as a string", () => {
    const schema: EnvSchema = { SITE: { type: "url" } };
    const { data } = validate(schema, {
      env: { SITE: "https://example.com" },
      onError: "return",
    });
    expect(data["SITE"]).toBe("https://example.com");
  });

  it("keeps a valid email as a string", () => {
    const schema: EnvSchema = { EMAIL: { type: "email" } };
    const { data } = validate(schema, {
      env: { EMAIL: "user@example.com" },
      onError: "return",
    });
    expect(data["EMAIL"]).toBe("user@example.com");
  });
});
