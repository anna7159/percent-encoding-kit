# percent-encoding-kit

Decodes percent-encoded strings per RFC 3986, interpreting the resulting bytes as UTF-8.

```javascript
import { decodePercentEncoded, decodePercentEncodedToBytes } from "percent-encoding-kit";

// "café"
const text = decodePercentEncoded("caf%C3%A9");

// Uint8Array [ 0x63, 0x61, 0x66, 0xC3, 0xA9 ]
const bytes = decodePercentEncodedToBytes("caf%C3%A9");
```

## Why this exists

Most decoding paths conflate two steps — unescaping `%XX` sequences and interpreting bytes as text — into one call on `decodeURIComponent`, which throws on anything malformed. This library separates them: `decodePercentEncodedToBytes` produces raw bytes, `decodePercentEncoded` wraps it with a non-fatal UTF-8 `TextDecoder` so invalid byte sequences become U+FFFD instead of exceptions.

The deliberate trade-off is in handling bad escapes. When `%` is followed by non-hex characters (e.g. `%GG`, `%2`, or a trailing `%`), the library preserves those characters literally rather than throwing or silently dropping them. This mirrors what browsers do in practice and lets the caller decide whether to reject the input afterward.

## Edge cases

- `%` at end of string → kept literally.
- `%2` (truncated escape) → kept literally as `%2`.
- `%GG` (invalid hex digits) → kept literally as `%GG`.
- Invalid UTF-8 byte sequences (e.g. `%FF` alone) → replaced with `` (U+FFFD), not thrown.

## Exports

- `decodePercentEncoded(string): string` — full decode to a UTF-8 string.
- `decodePercentEncodedToBytes(string): Uint8Array` — byte-level decode; does not interpret UTF-8.
