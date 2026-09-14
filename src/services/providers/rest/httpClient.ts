import { env } from "@/config/env";
import { servicesConfig } from "@/services/config";

/** Minimal JSON client for self-hosted endpoints. No vendor SDKs. */
export async function getJson<T>(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const base = baseUrl || env.apiUrl || servicesConfig.baseUrl;
  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Zuvvi API ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

export async function postJson<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
  const base = baseUrl || env.apiUrl || servicesConfig.baseUrl;
  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : `${base}/`);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Zuvvi API ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}
