export function isSeedEmail(email?: string | null) {
  return Boolean(email?.endsWith("@seed.divoly.com"));
}

export function publicContributorLabel(user?: { name?: string | null; email?: string | null } | null) {
  if (!user || isSeedEmail(user.email)) return "Divoly library";
  return user.name?.trim() || user.email?.split("@")[0] || "Divoly contributor";
}
