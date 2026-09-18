import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CASECLOSEDFL_INBOUND_DIGITS,
  formatUsDisplay,
  isForbiddenInboundPhone,
  resolvePublicPhone,
  toTelHref,
} from "./public-phone.ts";

describe("public inbound phone", () => {
  it("reads VITE_PUBLIC_PHONE first, then INBOUND_PHONE_NUMBER", () => {
    const fromVite = resolvePublicPhone({
      VITE_PUBLIC_PHONE: "+1 415-555-0199",
      INBOUND_PHONE_NUMBER: "+1 212-555-0100",
    });
    assert.equal(fromVite.provisioned, true);
    assert.equal(fromVite.tel, "+14155550199");
    assert.equal(fromVite.display, "(415) 555-0199");

    const fromInbound = resolvePublicPhone({ INBOUND_PHONE_NUMBER: "2125550100" });
    assert.equal(fromInbound.tel, "+12125550100");
    assert.equal(fromInbound.display, "(212) 555-0100");
  });

  it("does not hardcode or accept the CaseClosedFL inbound number", () => {
    assert.equal(CASECLOSEDFL_INBOUND_DIGITS, "5615661360");
    for (const raw of ["+15615661360", "561-566-1360", "(561) 566-1360", "1 561 566 1360"]) {
      assert.equal(isForbiddenInboundPhone(raw), true);
      const resolved = resolvePublicPhone({ VITE_PUBLIC_PHONE: raw });
      assert.equal(resolved.provisioned, false);
      assert.equal(resolved.blocked, "caseclosedfl");
      assert.equal(resolved.tel, "");
    }
  });

  it("stays unprovisioned when env is empty (no fake 1-800 default)", () => {
    const phone = resolvePublicPhone({});
    assert.equal(phone.provisioned, false);
    assert.equal(phone.tel, "");
    assert.equal(phone.display, "");
  });

  it("formats E.164 tel hrefs", () => {
    assert.equal(toTelHref("4155550199"), "+14155550199");
    assert.equal(toTelHref("+14155550199"), "+14155550199");
    assert.equal(formatUsDisplay("4155550199"), "(415) 555-0199");
  });
});
