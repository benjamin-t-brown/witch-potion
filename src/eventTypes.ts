import { SPAN } from './dom';

export interface GameEvent {
  title: string;
  icon: string;
  vars?: Record<string, { str: string; parsed: string | undefined }>;
  children: GameEventChild[];
}

export interface GameEventChild {
  id: string;
  type: 'choice' | 'roll' | 'end' | 'modify' | 'garden';
  p?: string;
  choices?: GameEventChoice[];
  rolls?: string[];
  parsedRolls?: ResourceType[];
  mod?: string[];
  parsedMod?: {
    amt: number;
    resource: ResourceType;
  }[];
  next?: string;
  pass?: string;
  fail?: string;
  re?: boolean; // should regenerate events
}

export interface GameEventChoice {
  text: string;
  parsedCondition?: () => boolean;
  conditionText?: string;
  next: string;
}

export enum ResourceType {
  GOLD = 'GOLD',
  HERB_SPARKLEWEED = 'HERB_SPARKLEWEED',
  HERB_BRAMBLEBERRY = 'HERB_BRAMBLEBERRY',
  HERB_SPECIALPETAL = 'HERB_SPECIALPETAL',
  REAG_SKY_DUST = 'REAG_SKY_DUST',
  REAG_SUN_POWDER = 'REAG_SUN_POWDER',
  POT_COLD_CURE = 'POT_COLD_CURE',
  POT_DRAGON_SWEAT = 'POT_DRAGON_SWEAT',
  POT_MIASMA_OF_MIDNIGHT = 'POT_MIASMA_OF_MIDNIGHT',
  POT_TINCTURE_OF_TASTE = 'POT_TINCTURE_OF_TASTE',
  // POT_REDO = 'POT_REDO',
  POT_EMPATHY = 'POT_EMPATHY',
  POT_GROWTH = 'POT_GROWTH',
  POT_LIQUID_LUCK = 'POT_LIQUID_LUCK',
  POT_POWER_POTION = 'POT_POWER_POTION',
  DICE_FIRE_MAGIC = 'DICE_FIRE_MAGIC',
  DICE_HEART_MAGIC = 'DICE_HEART_MAGIC',
  DICE_GROW = 'DICE_GROW',
  DICE_ANY = 'ANY',
  DICE_NEW = 'DICE_NEW',
  BLUEPRINT_SPARKLEWEED = 'BLUEPRINT_SPARKLEWEED',
  BLUEPRINT_BRAMBLEBERRY = 'BLUEPRINT_BRAMBLEBERRY',
  BLUEPRINT_SPECIALPETAL = 'BLUEPRINT_SPECIALPETAL',
  CONTRACT_VILLAGER = 'CONTRACT_VILLAGER',
  CONTRACT_CAT = 'CONTRACT_CAT',
  FAVOR_CAT = 'FAVOR_CAT',
  EFFECT_COLD = 'EFFECT_COLD',
  EFFECT_GREEN_THUMB = 'EFFECT_GREEN_THUMB',
}

export const DICE_NAMES = [
  ResourceType.DICE_FIRE_MAGIC,
  ResourceType.DICE_HEART_MAGIC,
  ResourceType.DICE_GROW,
];

export const HERB_NAMES = [
  ResourceType.HERB_SPARKLEWEED,
  ResourceType.HERB_BRAMBLEBERRY,
  ResourceType.HERB_SPECIALPETAL,
];
export const HERB_TIER_1_NAMES = [
  ResourceType.HERB_SPARKLEWEED,
  ResourceType.HERB_BRAMBLEBERRY,
];
export const HERB_TIER_2_NAMES = [ResourceType.HERB_SPECIALPETAL];

export const REAGENT_NAMES = [
  ResourceType.REAG_SKY_DUST,
  ResourceType.REAG_SUN_POWDER,
];
export const REAGENT_TIER_1_NAMES = [ResourceType.REAG_SUN_POWDER];
export const REAGENT_TIER_2_NAMES = [ResourceType.REAG_SKY_DUST];

export const POTION_NAMES = [
  ResourceType.POT_GROWTH,
  ResourceType.POT_POWER_POTION,
  ResourceType.POT_LIQUID_LUCK,
  ResourceType.POT_COLD_CURE,
  ResourceType.POT_DRAGON_SWEAT,
  ResourceType.POT_MIASMA_OF_MIDNIGHT,
  ResourceType.POT_TINCTURE_OF_TASTE,
];

export const BLUEPRINT_NAMES = [
  ResourceType.BLUEPRINT_SPARKLEWEED,
  ResourceType.BLUEPRINT_BRAMBLEBERRY,
  ResourceType.BLUEPRINT_SPECIALPETAL,
];

export const BUY_COSTS = {
  [ResourceType.REAG_SUN_POWDER]: 2,
  [ResourceType.REAG_SKY_DUST]: 3,
};

export const SELL_COSTS = {
  // [ResourceType.REAG_SKY_DUST]: 1,
  // [ResourceType.REAG_SUN_POWDER]: 1,
  // [ResourceType.HERB_SPARKLEWEED]: 1,
  // [ResourceType.HERB_BRAMBLEBERRY]: 2,
  // [ResourceType.HERB_SPECIALPETAL]: 2,
  [ResourceType.POT_COLD_CURE]: 2,
  [ResourceType.POT_DRAGON_SWEAT]: 2,
  [ResourceType.POT_MIASMA_OF_MIDNIGHT]: 5,
  [ResourceType.POT_TINCTURE_OF_TASTE]: 5,
  [ResourceType.POT_LIQUID_LUCK]: 10,
  [ResourceType.POT_POWER_POTION]: 10,
  [ResourceType.POT_GROWTH]: 10,
};

export const RECIPES = {
  [ResourceType.POT_GROWTH]: [
    ResourceType.REAG_SKY_DUST,
    ResourceType.REAG_SUN_POWDER,
  ],
  [ResourceType.POT_EMPATHY]: [
    ResourceType.HERB_BRAMBLEBERRY,
    ResourceType.HERB_SPARKLEWEED,
    ResourceType.REAG_SUN_POWDER,
  ],
  [ResourceType.POT_POWER_POTION]: [
    ResourceType.HERB_SPECIALPETAL,
    ResourceType.REAG_SUN_POWDER,
  ],
  [ResourceType.POT_LIQUID_LUCK]: [
    ResourceType.HERB_BRAMBLEBERRY,
    ResourceType.HERB_SPARKLEWEED,
    ResourceType.HERB_SPECIALPETAL,
    ResourceType.REAG_SUN_POWDER,
  ],
  [ResourceType.POT_COLD_CURE]: [
    ResourceType.HERB_BRAMBLEBERRY,
    ResourceType.REAG_SKY_DUST,
  ],
  [ResourceType.POT_DRAGON_SWEAT]: [
    ResourceType.HERB_SPARKLEWEED,
    ResourceType.REAG_SKY_DUST,
  ],
  [ResourceType.POT_MIASMA_OF_MIDNIGHT]: [
    ResourceType.HERB_SPARKLEWEED,
    ResourceType.HERB_SPARKLEWEED,
    ResourceType.REAG_SKY_DUST,
  ],
  [ResourceType.POT_TINCTURE_OF_TASTE]: [
    ResourceType.HERB_BRAMBLEBERRY,
    ResourceType.HERB_BRAMBLEBERRY,
    ResourceType.REAG_SKY_DUST,
  ],
};

export enum ResourceTypeFunc {
  FUNC_RANDOM_HERB_TIER_1 = 'HERB1',
  FUNC_RANDOM_HERB_TIER_2 = 'HERB2',
  FUNC_RANDOM_HERB_TIER_3 = 'HERB3',
  FUNC_RANDOM_HERB_ANY = 'HERB',
  FUNC_RANDOM_REAGENT_TIER_1 = 'REAG1',
  FUNC_RANDOM_REAGENT_TIER_2 = 'REAG2',
  FUNC_RANDOM_REAGENT_ANY = 'REAG',
  FUNC_RANDOM_POTION_TIER_1 = 'POT1',
  FUNC_RANDOM_POTION_ANY = 'POT',
  FUNC_RANDOM_GOLD = 'GOLD',
  FUNC_RANDOM_FIRE_MAGIC = 'FIRE',
  FUNC_RANDOM_HEART_MAGIC = 'HEART',
  FUNC_RANDOM_GROW = 'GROW',
}

export enum ConditionFunc {
  HAS_RESOURCE = 'HAS',
}

export const ICON_GOLD = '💰';
export const ICON_HERB = '🌿';
export const ICON_REAGENT = '🧪';
export const ICON_POTION = '🧴';
export const ICON_FIRE_MAGIC = '🔥';
export const ICON_HEART_MAGIC = '♥️';
export const ICON_LUCK = '🍀';
export const ICON_CAT = '<span style="filter: grayscale(100%)">🐈‍⬛</span>';
export const ICON_GROW = '🌱';
export const ICON_CONTRACT = '📃';
export const ICON_EXCLAMATION = '❗';
export const ICON_KING = '👑';
export const ICON_VILLAGER = '👨';
export const ICON_DRAGON = '🐲';
export const ICON_FELLA = '👾';
export const ICON_FAIRY = '🧚🏿‍♀️';
export const ICON_WITCH = '🧙🏿‍♀️';
export const ICON_WEATHER = '🌤';
export const ICON_DICE = '🎲';
export const ICON_COLD = '🤧';

export interface LabelObj {
  l: string;
  icon: string;
  dsc: string;
}

export const Labels: Record<string, LabelObj> = {
  [ResourceType.DICE_FIRE_MAGIC]: {
    l: 'Fire Magic',
    icon: ICON_FIRE_MAGIC,
    dsc: 'Used to fend off your enemies.',
  },
  [ResourceType.DICE_HEART_MAGIC]: {
    l: 'Heart Magic',
    icon: ICON_HEART_MAGIC,
    dsc: 'Can guide situations and people.',
  },
  [ResourceType.DICE_GROW]: {
    l: 'Grow',
    icon: ICON_GROW,
    dsc: 'Used to grow your magical garden.',
  },
  [ResourceType.DICE_ANY]: {
    l: 'Any',
    icon: ICON_DICE,
    dsc: 'Any magic dice.',
  },
  [ResourceType.GOLD]: {
    l: 'Gold',
    icon: ICON_GOLD,
    dsc: 'Merchants love it.',
  },
  [ResourceType.HERB_SPARKLEWEED]: {
    l: 'Sparkleweed',
    icon: ICON_HERB,
    dsc: 'A glittery weed.',
  },
  [ResourceType.HERB_BRAMBLEBERRY]: {
    l: 'Brambleberry',
    icon: ICON_HERB,
    dsc: 'Magical berries that make potion bases.',
  },
  [ResourceType.HERB_SPECIALPETAL]: {
    l: 'Specialpetal',
    icon: ICON_HERB,
    dsc: 'Rare flower for rare potions.',
  },
  [ResourceType.REAG_SKY_DUST]: {
    l: 'Sky Dust',
    icon: ICON_REAGENT,
    dsc: 'Common dust collected on magical clouds.',
  },
  [ResourceType.REAG_SUN_POWDER]: {
    l: 'Sun Powder',
    icon: ICON_REAGENT,
    dsc: 'Rare ground-up sunbeams.',
  },
  [ResourceType.POT_COLD_CURE]: {
    l: 'Cold Cure',
    icon: ICON_POTION,
    dsc: 'Instantly cures the common cold.',
  },
  [ResourceType.POT_DRAGON_SWEAT]: {
    l: 'Dragon Sweat',
    icon: ICON_POTION,
    dsc: 'Immunity to fire.',
  },
  [ResourceType.POT_MIASMA_OF_MIDNIGHT]: {
    l: 'Miasma of Midnight',
    icon: ICON_POTION,
    dsc: 'Sleep until midnight exactly.',
  },
  [ResourceType.POT_TINCTURE_OF_TASTE]: {
    l: 'Tincture of Taste',
    icon: ICON_POTION,
    dsc: 'Makes any food taste better.',
  },
  [ResourceType.POT_EMPATHY]: {
    l: 'Empathy Potion',
    icon: ICON_POTION,
    dsc: 'Grants supernatural empathy.',
  },
  [ResourceType.POT_LIQUID_LUCK]: {
    l: 'Liquid Luck',
    icon: ICON_POTION,
    dsc: 'Grants luck.',
  },
  [ResourceType.POT_POWER_POTION]: {
    l: 'Power Potion',
    icon: ICON_POTION,
    dsc: 'The power within you is amplified.',
  },
  // [ResourceType.POT_REDO]: {
  //   l: 'Retry Serum',
  //   icon: ICON_POTION,
  //   dsc: 'Failed dice roll again.',
  // },
  [ResourceType.POT_GROWTH]: {
    l: 'Growth Potion',
    icon: ICON_POTION,
    dsc: 'Increases growth.',
  },
  [ResourceType.CONTRACT_VILLAGER]: {
    l: 'Contract',
    icon: ICON_CONTRACT,
    dsc: 'A simple request.',
  },
  [ResourceType.CONTRACT_CAT]: {
    l: 'Cat',
    icon: ICON_CONTRACT,
    dsc: 'A complex request.',
  },
  [ResourceType.FAVOR_CAT]: {
    l: "Cat's Favor",
    icon: ICON_CAT,
    dsc: 'Your standing with the Black Cat.',
  },
  [ResourceType.BLUEPRINT_SPARKLEWEED]: {
    l: 'Seed of Sparkleweed',
    icon: ICON_GROW,
    dsc: 'Allows you 1 additional Sparkleweed seed bed.',
  },
  [ResourceType.BLUEPRINT_BRAMBLEBERRY]: {
    l: 'Seed of Brambleberry',
    icon: ICON_GROW,
    dsc: 'Allows you 1 additional Brambleberry seed bed.',
  },
  [ResourceType.BLUEPRINT_SPECIALPETAL]: {
    l: 'Seed of Specialpetal',
    icon: ICON_GROW,
    dsc: 'Allows you 1 additional Specialpetal seed bed.',
  },
  [ResourceType.DICE_NEW]: {
    l: 'Magic Dice',
    icon: ICON_DICE,
    dsc: 'A new magic dice.',
  },
  [ResourceType.EFFECT_COLD]: {
    l: 'Cold',
    icon: ICON_COLD,
    dsc: 'You have a cold.',
  },
  [ResourceType.EFFECT_GREEN_THUMB]: {
    l: 'Green Thumbs',
    icon: ICON_GROW,
    dsc: 'Your thumbs are bright green.',
  },
};

for (const key in Labels) {
  Labels[key].icon = `<${SPAN} class="icon">${Labels[key].icon}</${SPAN}>`;
}

export const getResourceFromLabel = (label: string) => {
  const ind = label.lastIndexOf('>');
  if (ind > -1) {
    label = label.slice(ind + 1);
  }
  for (const key in Labels) {
    if (Labels[key].l.toLowerCase() === label.toLowerCase()) {
      return key as ResourceType;
    }
  }
};

export const MONSTER_NAMES = [
  'Giant Frog',
  'Giant Spider',
  'Medusa',
  'Cyclops',
  'Ogre',
  'Troll',
  'Phoenix',
  'Hydra',
  'Minotaur',
  'Griffon',
  'Golem',
  'Wraith',
  'Demon',
  // 'Dragon',
  'Lich',
  'Giant',
  'Wyrm',
];
