import {
  appendChild,
  BUTTON,
  createElement,
  DIV,
  domAddEventListener,
  EVENT_CLICK,
  INNER_HTML,
  P,
} from '../dom';
import { gameEventRunChild, GameEventState } from '../eventRunner';
import { ICON_GROW, Labels, ResourceType } from '../eventTypes';
import { gameHarvest, gameRollDiceUi } from '../game';
import {
  blueprintToHerb,
  createMagicDiceGrow,
  DiceWithFaces,
  GameState,
  gameStateGetGarden,
  gameStateGetResourceCount,
  gameStateModifyResource,
} from '../state';
import { createDice, Dice } from './Dice';
import { eventModalCreateButtonChosenText } from './EventModal';
import { highlightResource } from './HoverDescription';
import { CLASS_BTN_TEXT, COLOR_HIGHLIGHT_DARK_TEXT } from './style';

export interface Garden {
  root: HTMLElement;
  slots: GardenSlot[];
  harvestButtons: HTMLElement[];
}

interface GardenSlot {
  magicDice: DiceWithFaces[];
  diceList: Dice[];
  type: ResourceType;
  resultArea: HTMLElement;
  gardenDiceList: HTMLElement;
}

export const createGarden = (
  state: GameState,
  eventState: GameEventState
): Garden => {
  const blueprints = gameStateGetGarden(state);

  const root = createElement(DIV, {
    class: 'garden',
  });

  const slots: GardenSlot[] = [];
  const harvestButtons: HTMLElement[] = [];

  const hasGreenThumb =
    gameStateGetResourceCount(state, ResourceType.EFFECT_GREEN_THUMB) > 0;

  for (const blueprint of blueprints) {
    const gardenSlot = createElement(DIV, {
      class: 'garden-slot',
    });
    const labelObj = Labels[blueprint];
    const gardenLabel = createElement(DIV, {
      [INNER_HTML]: labelObj.l,
      class: 'garden-label',
    });
    const gardenDiceContainer = createElement(DIV, {
      class: 'garden-dice-container',
    });
    const gardenDiceList = createElement(DIV, {
      class: 'garden-dice-list',
    });
    const gardenDiceResult = createElement(DIV, {
      class: 'garden-dice-result flxcr',
    });
    appendChild(gardenSlot, gardenLabel);
    appendChild(gardenSlot, gardenDiceContainer);
    appendChild(gardenDiceContainer, gardenDiceList);
    appendChild(gardenDiceContainer, gardenDiceResult);
    appendChild(root, gardenSlot);

    const magicDice = [...state.magicDice];

    const diceElements: Dice[] = [];
    for (let i = 0; i < magicDice.length; i++) {
      const dice = createDice(state, magicDice[i]);
      diceElements.push(dice);
      appendChild(gardenDiceList, dice.root);
    }

    slots.push({
      magicDice,
      diceList: diceElements,
      type: blueprint,
      resultArea: gardenDiceResult,
      gardenDiceList,
    });
  }

  if (hasGreenThumb) {
    const greenThumbLabel = Labels[ResourceType.EFFECT_GREEN_THUMB];
    const greenThumbText = createElement(P, {
      class: CLASS_BTN_TEXT,
      [INNER_HTML]: `Your ${greenThumbLabel.l}${greenThumbLabel.icon} will let you harvest double.`,
    });
    appendChild(root, greenThumbText);
  }

  const handleHarvestClick = async () => {
    // setStyle(harvestButton, {
    //   visibility: 'hidden',
    //   padding: '0',
    //   margin: '-4px',
    // });
    for (const button of harvestButtons) {
      button.remove();
    }
    gameStateModifyResource(state, ResourceType.EFFECT_GREEN_THUMB, -1);
    const harvestText = eventModalCreateButtonChosenText('Harvest');
    appendChild(root, harvestText);

    const promises: Promise<ResourceType[]>[] = [];
    for (const slot of slots) {
      promises.push(
        gameRollDiceUi(
          slot.magicDice.map((d, i) => ({
            dice: d,
            elem: slot.diceList[i],
          })),
          [ResourceType.DICE_GROW]
        )
      );
    }
    const diceRolls = await Promise.all(promises);

    const harvestResults = gameHarvest(
      state,
      diceRolls.map((r, i) => ({
        resourceType: blueprintToHerb(slots[i].type),
        diceResults: r,
      })),
      hasGreenThumb ? 2 : 1
    );
    for (let i = 0; i < harvestResults.length; i++) {
      slots[i].resultArea[INNER_HTML] = '+' + String(harvestResults[i]);
    }

    gameEventRunChild(state, eventState, eventState.event.children[1]);
  };

  const harvestButton = createElement(BUTTON, {
    class: CLASS_BTN_TEXT,
    [INNER_HTML]: 'Harvest',
  });
  domAddEventListener(harvestButton, EVENT_CLICK, handleHarvestClick);
  appendChild(root, harvestButton);
  harvestButtons.push(harvestButton);

  const hasGrowthPotion =
    gameStateGetResourceCount(state, ResourceType.POT_GROWTH) > 0;
  if (hasGrowthPotion) {
    const growMagicDiceHl = highlightResource(
      ResourceType.DICE_GROW,
      COLOR_HIGHLIGHT_DARK_TEXT
    );
    const potGrowthLabelText = `Use a ${highlightResource(
      ResourceType.POT_GROWTH,
      COLOR_HIGHLIGHT_DARK_TEXT
    )}<br>(adds 1 all ${growMagicDiceHl} dice).`;
    const potOfGrowthButton = createElement(BUTTON, {
      class: CLASS_BTN_TEXT,
      [INNER_HTML]: potGrowthLabelText,
    });
    domAddEventListener(potOfGrowthButton, EVENT_CLICK, () => {
      gameStateModifyResource(state, ResourceType.POT_GROWTH, -1);
      for (const slot of slots) {
        const growDice = createMagicDiceGrow();
        const diceElem = createDice(state, growDice, ICON_GROW);
        slot.diceList.push(diceElem);
        slot.magicDice.push(growDice);
        appendChild(slot.gardenDiceList, diceElem.root);
      }
      // potOfGrowthButton.remove();
      (potOfGrowthButton as HTMLButtonElement).disabled = true;
      // const potGrowthLabelTextElem =
      //   eventModalCreateButtonChosenText(potGrowthLabelText);
      // prependChild(root, potGrowthLabelTextElem);
    });
    appendChild(root, potOfGrowthButton);
    harvestButtons.push(potOfGrowthButton);
  }

  return { root, slots, harvestButtons };
};
