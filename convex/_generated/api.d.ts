/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_generateDraft from "../ai/generateDraft.js";
import type * as ai_parseCommand from "../ai/parseCommand.js";
import type * as calendar from "../calendar.js";
import type * as calendarActions from "../calendarActions.js";
import type * as contacts from "../contacts.js";
import type * as draftRegeneration from "../draftRegeneration.js";
import type * as draftRegenerationAction from "../draftRegenerationAction.js";
import type * as drafts from "../drafts.js";
import type * as emails from "../emails.js";
import type * as labels from "../labels.js";
import type * as sync from "../sync.js";
import type * as syncMutations from "../syncMutations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/generateDraft": typeof ai_generateDraft;
  "ai/parseCommand": typeof ai_parseCommand;
  calendar: typeof calendar;
  calendarActions: typeof calendarActions;
  contacts: typeof contacts;
  draftRegeneration: typeof draftRegeneration;
  draftRegenerationAction: typeof draftRegenerationAction;
  drafts: typeof drafts;
  emails: typeof emails;
  labels: typeof labels;
  sync: typeof sync;
  syncMutations: typeof syncMutations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
