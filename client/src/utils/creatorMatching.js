const normalize = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const hasMatchPreferences = (preferences) =>
  Boolean(
    normalize(preferences.category) ||
    normalize(preferences.location) ||
    (preferences.skills || []).some((skill) => normalize(skill)),
  );

export function calculateMatchScore(preferences, creator) {
  let score = 0;

  if (
    normalize(preferences.category) &&
    normalize(preferences.category) === normalize(creator.category)
  ) {
    score += 40;
  }

  if (
    normalize(preferences.location) &&
    normalize(preferences.location) === normalize(creator.location)
  ) {
    score += 25;
  }

  const creatorSkills = new Set((creator.skills || []).map(normalize));
  const matchedSkills = new Set(
    (preferences.skills || [])
      .map(normalize)
      .filter((skill) => skill && creatorSkills.has(skill)),
  );
  score += matchedSkills.size * 10;

  return Math.min(100, score);
}
