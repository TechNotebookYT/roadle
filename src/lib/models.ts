export type ModelCatalog = Record<string, string[]>;

const DEFAULT_MODELS_URL = "/models.json";

export async function loadModelCatalog(): Promise<ModelCatalog> {
  try {
    const res = await fetch(DEFAULT_MODELS_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    return validateCatalog(data);
  } catch {
    return {};
  }
}

export function validateCatalog(v: unknown): ModelCatalog {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: ModelCatalog = {};
  for (const [make, models] of Object.entries(v as Record<string, unknown>)) {
    if (typeof make !== "string" || make.length === 0) continue;
    if (!Array.isArray(models)) continue;
    const valid = models.filter(
      (m): m is string => typeof m === "string" && m.length > 0,
    );
    if (valid.length === 0) continue;
    out[make] = valid;
  }
  return out;
}

export function makesFromCatalog(catalog: ModelCatalog): string[] {
  return Object.keys(catalog).sort((a, b) => a.localeCompare(b));
}
