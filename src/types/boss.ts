export interface Boss {
  id: string;
  name: string;
  title: string;
  currentHp: number;
  maxHp: number;
  avatar: string; // boss sprite identifier
  rewardGold: number;
  rewardXp: number;
  defeated: boolean;
  description: string;
}
