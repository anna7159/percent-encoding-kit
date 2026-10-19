/**
 * Percent-encoding decoder implementing RFC 3986 decoding with practical
 * handling for malformed input commonly found in the wild.
 */

const HEX = "0123456789ABCDEFabcdef";

/**
 * Returns the numeric value of a single hex digit, or -1 if invalid.
 * Used instead of parseInt to fail fast per-character without allocations.
 */
function hexValue(ch) {
  const code = ch.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48;
  if (code >= 65 && code <= 70) return code - 55;
  if (code >= 97 && code <= 102) return code - 87;
  return -1;
}

/**
 * Decodes a percent-encoded string into a Uint8Array of raw bytes.
 *
 * Malformed escapes are preserved literally as their original characters:
 *   - "%GG" — the % and both hex digits are kept as-is (0x25, 'G', 'G').
 *   - "%2"  — the % and '2' are kept as-is.
 *   - "%"   — kept as-is.
 *
 * This mirrors how browsers and cURL typically cope: they don't throw, they
 * surface the raw text so the caller can decide whether to reject it.
 */
export function decodePercentEncodedToBytes(input) {
  const out = [];
  const len = input.length;
  let i = 0;

  while (i < len) {
    const ch = input[i];

    if (ch === "%") {
      const next1 = i + 1;
      const next2 = i + 2;

      if (next2 < len) {
        const h1 = input[next1];
        const h2 = input[next2];

        if (HEX.includes(h1) && HEX.includes(h2)) {
          out.push((hexValue(h1) << 4) | hexValue(h2));
          i = next2 + 1;
          continue;
        }
      }

      // Malformed: emit the '%' literally so nothing is silently dropped.
      out.push(0x25);
      i++;
    } else {
      out.push(ch.charCodeAt(0));
      i++;
    }
  }

  return Uint8Array.from(out);
}

/**
 * Decodes a percent-encoded string into a UTF-8 JavaScript string.
 *
 * After percent-decoding to bytes, the bytes are interpreted as UTF-8.
 * Invalid UTF-8 sequences are replaced with U+FFFD () rather than throwing.
 *
 * This two-step approach is deliberate: RFC 3986 percent-encoding operates
 * on raw bytes, so a complete implementation must separate byte-level
 * decoding from character interpretation. The textDecoder steps in only
 * at the end.
 */
export function decodePercentEncoded(input) {
  const bytes = decodePercentEncodedToBytes(input);
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}
