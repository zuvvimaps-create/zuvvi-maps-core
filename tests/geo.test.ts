import assert from "node:assert/strict";
import test from "node:test";
import { boundsOf, distanceMeters, interpolate } from "../src/utils/geo.ts";

test("calcula distância zero para o mesmo ponto", () => {
  const point = { lat: -22.66, lng: -51.08 };
  assert.equal(distanceMeters(point, point), 0);
});

test("interpola coordenadas e calcula seus limites", () => {
  const start = { lat: -22, lng: -51 };
  const end = { lat: -24, lng: -49 };

  assert.deepEqual(interpolate(start, end, 0.5), { lat: -23, lng: -50 });
  assert.deepEqual(boundsOf([start, end]), [
    [-51, -24],
    [-49, -22],
  ]);
  assert.equal(boundsOf([]), null);
});
