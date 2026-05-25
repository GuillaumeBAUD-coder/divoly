type SluggableAnswer = {
  prompt: string;
};

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function answerSlug(answer: SluggableAnswer) {
  return slugify(answer.prompt);
}

export function modelSlug(modelName: string) {
  return slugify(modelName);
}

export function categorySlug(categoryName: string) {
  return slugify(categoryName);
}

export function contributorSlug(contributorName: string) {
  return slugify(contributorName);
}
