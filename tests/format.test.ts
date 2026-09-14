import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDistance,
  formatDuration,
  formatPriceLevel,
  formatRating,
  formatReviewCount,
} from "../src/utils/format.ts";

test("formata distâncias e durações em unidades legíveis", () => {
  assert.equal(formatDistance(420), "420 m");
  assert.equal(formatDistance(1_250), "1.3 km");
  assert.equal(formatDuration(30 * 60), "30 min");
  assert.equal(formatDuration(90 * 60), "1 h 30 min");
});

test("formata informações públicas de um lugar", () => {
  assert.equal(formatRating(4.7), "4,7");
  assert.equal(formatPriceLevel(3), "€€€");
  assert.equal(formatReviewCount(1_500), "1,5 mil");
});
