/**
 * percent-encoding-kit — public entry point.
 *
 * Re-exports everything from ./core so callers import a single path:
 *
 *   import { decodePercentEncoded } from "percent-encoding-kit";
 */

export { decodePercentEncoded, decodePercentEncodedToBytes } from "./core.js";
