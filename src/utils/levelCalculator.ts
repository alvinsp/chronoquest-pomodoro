export function calculateTargetXp(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getTitleForLevel(level: number): string {
  if (level < 3) return 'Novice Pixel Focus';
  if (level < 6) return 'Apprentice Chronomancer';
  if (level < 10) return 'Adept of Deep Work';
  if (level < 15) return 'Focus Knight';
  if (level < 20) return 'Flow State Sorcerer';
  if (level < 28) return 'Master of Time & Code';
  if (level < 38) return 'High Archon of Discipline';
  if (level < 50) return 'Legendary Grandmaster';
  return 'Mythic Omniscient Time Lord';
}

export function calculateXpGain(durationMinutes: number, multiplier: number = 1.0): { xp: number; gold: number } {
  // 1 minute of focus = 2 XP + 1 Gold, scaled by preset multiplier
  const xp = Math.round(durationMinutes * 2 * multiplier);
  const gold = Math.max(1, Math.round(durationMinutes * 0.8 * multiplier));
  return { xp, gold };
}
