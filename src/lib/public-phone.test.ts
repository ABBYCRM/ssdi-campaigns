import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CASECLOSEDFL_INBOUND_DIGITS,
  formatUsDisplay,
  isForbiddenInboundPhone,
  resolvePublicPhone,
  SSDI_INBOUND_E164,
  toTelHref,
} from "./public-phone.ts";

describe("public inbound phone", () => {
  it("defaults to the provisioned SSDI Vapi number", () => {
    const phone = resolvePublicPhone({});
    assert.equal(SSDI_INBOUND_E164, "+15614090180");
    assert.equal(phone.provisioned, true);
    assert.equal(phone.tel, "+15614090180");
    assert.equal(phone.display, "+1 (561) 409-0180");
  });

  it("reads VITE_PUBLIC_PHONE first, then INBOUND_PHONE_NUMBER", () => {
    const fromVite = resolvePublicPhone({
      VITE_PUBLIC_PHONE: "+1 415-555-0199",
      INBOUND_PHONE_NUMBER: "+1 212-555-0100",
    });
    assert.equal(fromVite.provisioned, true);
    assert.equal(fromVite.tel, "+14155550199");
    assert.equal(fromVite.display, "+1 (415) 555-0199");

    const fromInbound = resolvePublicPhone({ INBOUND_PHONE_NUMBER: "2125550100" });
    assert.equal(fromInbound.tel, "+12125550100");
    assert.equal(fromInbound.display, "+1 (212) 555-0100");
  });

  it("does not hardcode or accept the CaseClosedFL inbound number", () => {
    assert.equal(CASECLOSEDFL_INBOUND_DIGITS, "5615661360");
    assert.notEqual(phoneDigitsLast10(SSDI_INBOUND_E164), CASECLOSEDFL_INBOUND_DIGITS);
    for (const raw of ["+15615661360", "561-566-1360", "(561) 566-1360", "1 561 566 1360"]) {
      assert.equal(isForbiddenInboundPhone(raw), true);
      const resolved = resolvePublicPhone({ VITE_PUBLIC_PHONE: raw });
      assert.equal(resolved.provisioned, false);
      assert.equal(resolved.blocked, "caseclosedfl");
      assert.equal(resolved.tel, "");
    }
  });

  it("formats E.164 tel hrefs", () => {
    assert.equal(toTelHref("4155550199"), "+14155550199");
    assert.equal(toTelHref("+14155550199"), "+14155550199");
    assert.equal(formatUsDisplay("4155550199"), "+1 (415) 555-0199");
    assert.equal(formatUsDisplay("+15614090180"), "+1 (561) 409-0180");
  });
});

function phoneDigitsLast10(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}
