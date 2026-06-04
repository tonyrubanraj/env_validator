#!/usr/bin/env node

import { formatErrors } from "./formatter";
import { validate } from "./validate";

const HELP_MSG = "expected: enval --schema <path>";

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length !== 2) throw new Error(`invalid usage. ${HELP_MSG}`);
  if (args[0] !== "--schema")
    throw new Error(`unknown argument: ${args[0]}.\n${HELP_MSG}`);
  if (!args[1]) throw new Error(`missing schema path. ${HELP_MSG}`);
  const module = await import(args[1]);
  const schema = module.default;
  const result = validate(schema, { onError: "return" });
  if (result.success) process.exit(0);
  else {
    console.error(formatErrors(result.errors));
    process.exit(1);
  }
};

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
