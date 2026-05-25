import { CATEGORIES, MODELS } from "@/lib/data";
import { categorySlug, modelSlug } from "@/lib/slugs";

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((category) => categorySlug(category.name) === slug) ?? null;
}

export function getModelBySlug(slug: string) {
  return MODELS.find((model) => modelSlug(model.name) === slug) ?? null;
}

export function getModelByName(modelName: string) {
  return MODELS.find((model) => model.name === modelName) ?? null;
}

export function categorySeoPath(categoryName: string) {
  return `/best-ai-answers/${categorySlug(categoryName)}`;
}

export function modelCategorySeoPath(modelName: string, categoryName: string) {
  return `/ai-answers/${modelSlug(modelName)}/${categorySlug(categoryName)}`;
}

export function compareCategorySeoPath(categoryName: string) {
  return `/compare-ai-models/${categorySlug(categoryName)}`;
}

export function getModelColor(modelName: string, fallback = "#818cf8") {
  return MODELS.find((model) => model.name === modelName)?.color ?? fallback;
}
