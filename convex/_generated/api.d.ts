/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as email_templates_contact_email from "../email_templates/contact_email.js";
import type * as email_templates_status_email from "../email_templates/status_email.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_statusStyles from "../lib/statusStyles.js";
import type * as lib_tracking from "../lib/tracking.js";
import type * as routes from "../routes.js";
import type * as shipments from "../shipments.js";
import type * as users from "../users.js";
import type * as notificationJobs from "../notificationJobs.js";
import type * as contactLimits from "../contactLimits.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  crons: typeof crons;
  "email_templates/contact_email": typeof email_templates_contact_email;
  "email_templates/status_email": typeof email_templates_status_email;
  emails: typeof emails;
  http: typeof http;
  "lib/audit": typeof lib_audit;
  "lib/statusStyles": typeof lib_statusStyles;
  "lib/tracking": typeof lib_tracking;
  routes: typeof routes;
  shipments: typeof shipments;
  users: typeof users;
  notificationJobs: typeof notificationJobs;
  contactLimits: typeof contactLimits;
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

