import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { decodePercentEncoded, decodePercentEncodedToBytes } from "../src/core.js";

describe("decodePercentEncoded", () => {
  it("passes through a plain ASCII string", () => {
    assert.equal(decodePercentEncoded("hello world"), "hello world");
  });

  it("decodes a simple ASCII percent-escape", () => {
    assert.equal(decodePercentEncoded("hello%20world"), "hello world");
  });

  it("preserves literal '%' followed by non-hex", () => {
    assert.equal(decodePercentEncoded("100% done"), "100% done");
  });

  it("preserves '%' at end of string", () => {
    assert.equal(decodePercentEncoded("50%"), "50%");
  });

  it("preserves '%2' (truncated escape) literally", () => {
    assert.equal(decodePercentEncoded("foo%2"), "foo%2");
  });

  it("preserves '%GG' (invalid hex) literally", () => {
    assert.equal(decodePercentEncoded("foo%GGbar"), "foo%GGbar");
  });

  it("decodes a multi-byte UTF-8 sequence split across escapes", () => {
    // U+00E9 (é) is C3 A9 in UTF-8.
    assert.equal(decodePercentEncoded("caf%C3%A9"), "café");
  });

  it("decodes a three-byte UTF-8 character (U+20AC, €)", () => {
    // € is E2 82 AC.
    assert.equal(decodePercentEncoded("%E2%82%AC"), "€");
  });

  it("decodes a four-byte UTF-8 character (U+1F600, 😀)", () => {
    // 😀 is F0 9F 98 80.
    assert.equal(decodePercentEncoded("%F0%9F%98%80"), "😀");
  });

  it("replaces invalid UTF-8 bytes with the replacement character", () => {
    // 0xFF is not a valid UTF-8 lead byte.
    assert.equal(decodePercentEncoded("%FF"), "\uFFFD");
  });

  it("handles an empty string", () => {
    assert.equal(decodePercentEncoded(""), "");
  });

  it("decodes a string that mixes plain text and escapes", () => {
    assert.equal(decodePercentEncoded("a%2Bb%2Cc"), "a+b,c");
  });
});

describe("decodePercentEncodedToBytes", () => {
  it("returns a Uint8Array", () => {
    const result = decodePercentEncodedToBytes("hello");
    assert.ok(result instanceof Uint8Array);
  });

  it("decodes a simple escape to the expected byte value", () => {
    const result = decodePercentEncodedToBytes("%41");
    assert.equal(result.length, 1);
    assert.equal(result[0], 0x41);
  });

  it("preserves malformed '%GG' as literal '%', 'G', 'G'", () => {
    const result = decodePercentEncodedToBytes("%GG");
    assert.equal(result.length, 3);
    assert.equal(result[0], 0x25); // %
    assert.equal(result[1], 0x47); // G
    assert.equal(result[2], 0x47);
  });
});
