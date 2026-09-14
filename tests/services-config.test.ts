import assert from "node:assert/strict";
import test from "node:test";
import { createServicesConfig } from "../src/services/config.ts";
import { createRasterStyle, mapStyles } from "../src/config/mapConfig.ts";

test("mantém providers de demonstração quando não há API configurada", () => {
  const config = createServicesConfig({});

  assert.equal(config.provider, "demo");
  assert.equal(config.baseUrl, "");
  assert.equal(config.paths.places, "/places");
});

test("ativa o provider REST somente com URL e preserva caminhos customizados", () => {
  const config = createServicesConfig({
    VITE_ZUVVI_PROVIDER: "rest",
    VITE_ZUVVI_API_BASE_URL: "https://api.maps.example",
    VITE_ZUVVI_PLACES_PATH: "/v1/places",
  });

  assert.equal(config.provider, "rest");
  assert.equal(config.baseUrl, "https://api.maps.example");
  assert.equal(config.paths.places, "/v1/places");
});

test("não ativa REST sem uma URL base", () => {
  assert.equal(createServicesConfig({ VITE_ZUVVI_PROVIDER: "rest" }).provider, "demo");
});

test("gera estilo raster independente de TileJSON, sprites e fontes externas", () => {
  const style = createRasterStyle("zuvvi-test", ["https://tiles.example/{z}/{x}/{y}.png"]);

  assert.equal(style["version"], 8);
  assert.deepEqual(style["layers"], [{ id: "zuvvi-test", type: "raster", source: "zuvvi-test" }]);
  assert.equal("sprite" in style, false);
  assert.equal("glyphs" in style, false);
});

test("usa tiles raster diretos no estilo escuro padrão", () => {
  const serialized = JSON.stringify(mapStyles.dark.style);

  assert.match(serialized, /basemaps\.cartocdn\.com\/dark_all/);
  assert.doesNotMatch(serialized, /tiles\.basemaps\.cartocdn\.com/);
});
