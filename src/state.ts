import { BLUEPRINT_NAMES, GameEvent, ResourceType } from './eventTypes';
import { Calendar } from './ui/Calendar';
import { EventModal } from './ui/EventModal';
import { FavorMeter } from './ui/FavorMeter';
import { HoverDescription } from './ui/HoverDescription';
import { PrimaryResources } from './ui/PrimaryResources';

export interface GameState {
  events: GameEvent[];
  day: number;
  res: ResourceType[];
  magicDice: DiceWithFaces[];
  ui: {
    eventModal?: EventModal;
    res?: PrimaryResources;
    hoverDescription?: HoverDescription;
    calendar?: Calendar;
    favorMeter?: FavorMeter;
  };
  harvestRoll: number[];
  vars: {
    avblBlueprints: ResourceType[];
  };
}

export interface GardenDefinition {
  slots: GardenSlot[];
}

export interface GardenSlot {
  value: number;
  resource: ResourceType;
}

export type DiceWithFaces = [
  ResourceType,
  ResourceType,
  ResourceType,
  ResourceType,
  ResourceType,
  ResourceType
];

export const createGameState = (): GameState => {
  const state = {
    events: [],
    day: 0,
    res: [],
    magicDice: [
      createMagicDice(),
      // createMagicDice(),
      // createMagicDice(),
      // createMagicDice(),
    ],
    harvestRoll: [],
    ui: {},
    vars: {
      avblBlueprints: [ResourceType.BLUEPRINT_SPECIALPETAL],
    },
  };
  state.res.push(
    ResourceType.BLUEPRINT_SPARKLEWEED,
    ResourceType.BLUEPRINT_BRAMBLEBERRY
    // ResourceType.BLUEPRINT_SPECIALPETAL
  );

  return state;
};

export const createMagicDice = (): DiceWithFaces => {
  return [
    ResourceType.DICE_FIRE_MAGIC,
    ResourceType.DICE_FIRE_MAGIC,
    ResourceType.DICE_HEART_MAGIC,
    ResourceType.DICE_HEART_MAGIC,
    ResourceType.DICE_GROW,
    ResourceType.DICE_GROW,
  ];
};

export const createMagicDiceGrow = (): DiceWithFaces => {
  const arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push(ResourceType.DICE_GROW);
  }
  return arr as DiceWithFaces;
};

export const gameStateModifyResource = (
  state: GameState,
  resource: ResourceType,
  amt: number
) => {
  const iterations = Math.abs(amt);
  for (let i = 0; i < iterations; i++) {
    if (amt > 0) {
      state.res.push(resource);
    } else {
      const index = state.res.indexOf(resource);
      if (index !== -1) {
        state.res.splice(index, 1);
      }
    }
  }
};

export const gameStateGetResourceCount = (
  state: GameState,
  resource: ResourceType
) => {
  return state.res.filter(r => r === resource).length;
};

export const gameStateHasResource = (
  state: GameState,
  resource: ResourceType,
  amt: number
) => {
  return gameStateGetResourceCount(state, resource) >= amt;
};

export const gameStateGetGarden = (state: GameState) => {
  return state.res.filter(r => BLUEPRINT_NAMES.includes(r));
};

export const stringToResourceType = (str: string): ResourceType => {
  for (const resource of Object.values(ResourceType)) {
    if (str === resource) {
      return resource;
    }
  }
  throw new Error(`Unknown resource type: ${str}`);
};

export const gameStateHasHarvestRoll = (state: GameState) => {
  return state.harvestRoll.length > 0;
};

export const blueprintToHerb = (blueprint: ResourceType): ResourceType => {
  switch (blueprint) {
    case ResourceType.BLUEPRINT_SPARKLEWEED:
      return ResourceType.HERB_SPARKLEWEED;
    case ResourceType.BLUEPRINT_BRAMBLEBERRY:
      return ResourceType.HERB_BRAMBLEBERRY;
    case ResourceType.BLUEPRINT_SPECIALPETAL:
      return ResourceType.HERB_SPECIALPETAL;
    default:
      throw new Error(`Unknown blueprint: ${blueprint}`);
  }
};

export const getCurrentState = (): GameState => {
  return (window as any).state;
};
