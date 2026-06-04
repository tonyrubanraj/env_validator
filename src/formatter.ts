import { FieldError } from "./schema";

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

const supportsColor = (): boolean => {
  return process.stdout.isTTY === true && process.env["NO_COLOR"] === undefined;
};

const printText = (colored: boolean, color: string, text: string): string => {
  return colored ? `${color}${text}${RESET}` : text;
};

const formatError = (err: FieldError, colored: boolean): string => {
  return `${printText(colored, YELLOW, err.variable)}: ${err.message}${printText(colored, DIM, `${err.received ? `\n    received: "${err.received}"` : ``}${err.description ? `\n    ${err.description}` : ``}`)}`;
};

export const formatErrors = (errors: FieldError[]): string => {
  const colored = supportsColor();
  return `${printText(colored, RED + BOLD, `Environment variables validation - ${errors.length} errors`)}\n\n${errors.map((err) => formatError(err, colored)).join("\n\n")}`;
};
