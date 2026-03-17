// src/data/index.ts
import { GENERAL_FIELDS } from "./fields_general";
import { SPECIALIZED_FIELDS } from "./fields_specialized";
import { FormDefinition } from "../types";

export * from "./industries";
export * from "./forms";

export const FORM_FIELDS: Record<string, FormDefinition> = {
  ...GENERAL_FIELDS,
  ...SPECIALIZED_FIELDS,
};
