# enval

[![npm](https://img.shields.io/npm/v/@tonyrubanraj/enval)](https://www.npmjs.com/package/@tonyrubanraj/enval)

Zero-dependency TypeScript library to validate environment variables at startup — fail fast with clear, structured errors.

## Features

- Fully typed schema definition
- Six field types: `string`, `number`, `boolean`, `enum`, `url`, `email`
- Required fields, default values, and rich per-type constraints
- Coerces raw strings into proper JS values (`number`, `boolean`, …)
- Two error modes: throw immediately or collect and return all errors
- Optional CLI to validate a schema against the live environment

## What failure looks like

When validation fails, `enval` prints a single, scannable error block to stderr — one line per problem with the received value and an optional description beneath each entry:

```
Environment variables validation - 3 errors

API_KEY: value is required but missing

PORT: must be <= 65535
    received: "99999"
    The port the HTTP server listens on

NODE_ENV: must be one of development, production, test
    received: "staging"
```

Exit code is `1`, so CI pipelines and process managers catch it immediately.

---

## Installation

```bash
npm install @tonyrubanraj/enval
```

## Quick start

```typescript
import { validate } from "@tonyrubanraj/enval";

const result = validate(
  {
    PORT: { type: "number", min: 1, max: 65535, default: 3000 },
    NODE_ENV: { type: "enum", values: ["development", "production", "test"] },
    API_KEY: { type: "string", required: true },
    DEBUG: { type: "boolean", default: false },
  },
  { onError: "return" },
);

if (!result.success) {
  console.error(result.errors);
  process.exit(1);
}

// result.data is fully coerced
const { PORT, NODE_ENV, API_KEY, DEBUG } = result.data as {
  PORT: number;
  NODE_ENV: string;
  API_KEY: string;
  DEBUG: boolean;
};
```

## API

### `validate(schema, options?)`

Validates environment variables against a schema.

| Parameter         | Type                     | Description                                                                                 |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| `schema`          | `EnvSchema`              | Record of variable names to field specs                                                     |
| `options.env`     | `Record<string, string>` | Variable source — defaults to `process.env`                                                 |
| `options.onError` | `"throw" \| "return"`    | `"throw"` (default) throws on the first batch of errors; `"return"` always returns a result |

Returns a `ValidationResult`:

```typescript
interface ValidationResult {
  success: boolean;
  data: Record<string, unknown>; // coerced values
  errors: FieldError[];
}
```

---

## Schema field types

All field types share these common properties:

| Property      | Type       | Description                                  |
| ------------- | ---------- | -------------------------------------------- |
| `required`    | `true`     | Fails validation when the variable is absent |
| `description` | `string`   | Included in error messages for context       |
| `default`     | _(varies)_ | Used when the variable is absent or empty    |

### `number`

```typescript
{ type: "number", min?: number, max?: number, integer?: boolean }
```

| Property  | Description                  |
| --------- | ---------------------------- |
| `min`     | Value must be ≥ min          |
| `max`     | Value must be ≤ max          |
| `integer` | Value must be a whole number |

### `string`

```typescript
{ type: "string", minLength?: number, maxLength?: number, pattern?: RegExp }
```

| Property    | Description                             |
| ----------- | --------------------------------------- |
| `minLength` | Minimum character length                |
| `maxLength` | Maximum character length                |
| `pattern`   | Must match the given regular expression |

### `boolean`

```typescript
{ type: "boolean", truthy?: string[], falsy?: string[] }
```

Defaults accept `true / 1 / yes / on / enabled` as `true` and `false / 0 / no / off / disabled` as `false`. Override with custom `truthy` / `falsy` arrays.

### `enum`

```typescript
{ type: "enum", values: readonly string[] }
```

Value must be one of the items in `values`.

### `url`

```typescript
{ type: "url", protocols?: string[] }
```

| Property    | Description                              |
| ----------- | ---------------------------------------- |
| `protocols` | Allowed URL protocols, e.g. `["https:"]` |

### `email`

```typescript
{
  type: "email";
}
```

Value must be a valid email address.

---

## CLI

`enval` ships a CLI that validates the live `process.env` against a schema file and exits with code `1` if validation fails.

```bash
enval --schema ./env.schema.js
```

The schema file must export a default `EnvSchema` object:

```typescript
// env.schema.ts  (compiled to env.schema.js)
import type { EnvSchema } from "@tonyrubanraj/enval";

const schema: EnvSchema = {
  PORT: { type: "number", min: 1, max: 65535, required: true },
  API_KEY: { type: "string", required: true },
};

export default schema;
```

Add it as a pre-start check in `package.json`:

```json
{
  "scripts": {
    "prestart": "enval --schema ./dist/env.schema.js",
    "start": "node dist/index.js"
  }
}
```

---

## Types reference

```typescript
type EnvSchema = Record<string, FieldSpec>;

interface Options {
  env?: Record<string, string>;
  onError?: "return" | "throw";
}

interface FieldError {
  variable: string;
  message: string;
  description?: string;
  received?: string;
}

interface ValidationResult {
  success: boolean;
  data: Record<string, unknown>;
  errors: FieldError[];
}
```

## License

MIT
