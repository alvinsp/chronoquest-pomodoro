export interface UserHero {
  name: string;
  title: string;
  level: number;
  currentXp: number;
  targetXp: number;
  gold: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  avatarId: string;
  petId: string;
}

export type QuestType = 'sessions_today' | 'minutes_today' | 'streak_days' | 'identity_sessions';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: number;
  current: number;
  rewardXp: number;
  rewardGold: number;
  completed: boolean;
  claimed: boolean;
  requiredIdentityId?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'focus' | 'level' | 'mastery' | 'milestone';
  unlockedAt?: string;
  secret?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'avatar' | 'pet' | 'theme' | 'buff';
  price: number;
  description: string;
  icon: string;
  purchased: boolean;
  equipped: boolean;
}
