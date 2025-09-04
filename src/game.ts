import {
  appendChild,
  copyObject,
  createElement,
  INNER_HTML,
  P,
  setStyle,
  timeoutPromise,
} from './dom';
import { GameEventState, runEvent } from './eventRunner';
import {
  BLUEPRINT_NAMES,
  GameEvent,
  GameEventChild,
  Labels,
  MONSTER_NAMES,
  ResourceType,
} from './eventTypes';
import { createContractReturnEvent } from './generatedEvents';
import {
  createMagicDice,
  DiceWithFaces,
  GameState,
  gameStateGetResourceCount,
  gameStateModifyResource,
} from './state';
import { calendarAdvanceDayForward } from './ui/Calendar';
import { Dice, diceSetFace, diceSpin } from './ui/Dice';
import { eventModalAddChild, eventModalScrollToBottom } from './ui/EventModal';
import { setPrimaryResources } from './ui/PrimaryResources';
import { randInArray, randInRange } from './utils';

let EXPULSION_EVENT: GameEvent;

export const gameAdvanceDay = (state: GameState, msg?: string) => {
  eventModalAddChild(
    state.ui.eventModal,
    {
      id: '1',
      type: 'modify',
      p: msg ?? 'You close up your shop for the day.',
    },
    {
      event: state.events[state.day],
      evalVars: {},
      currentChildId: '1',
    },
    state
  );

  const moonAnim = createElement(P, {
    class: 'moon-anim',
  });
  appendChild(state.ui.eventModal.content, moonAnim);
  for (let i = 0; i < 2; i++) {
    appendChild(state.ui.eventModal.content, createElement('br'));
  }
  const phases = [...'🌕🌕🌕🌕🌖🌗🌘🌑🌒🌓🌔🌕🌕🌕🌕'];
  for (let i = 0; i < phases.length; i++) {
    timeoutPromise(i * 100).then(() => {
      moonAnim[INNER_HTML] = phases[i];
      eventModalScrollToBottom(state.ui.eventModal);
    });
  }

  state.day++;

  timeoutPromise(phases.length * 100).then(() => {
    moonAnim.remove();
    const sep = createElement(P, {
      [INNER_HTML]: '---<br>Day ' + state.day,
    });
    appendChild(state.ui.eventModal.content, sep);
    eventModalScrollToBottom(state.ui.eventModal);
    if (!msg) {
      calendarAdvanceDayForward(state.ui.calendar);
    }

    console.log('ADVANCE DAY', state.day, state.events[state.day]);
    const favorAmt = gameStateGetResourceCount(state, ResourceType.FAVOR_CAT);
    if (favorAmt === 0) {
      runEvent(state, EXPULSION_EVENT);
    } else {
      runEvent(state, state.events[state.day]);
    }
  });
};

export const gameHarvest = (
  state: GameState,
  slots: {
    resourceType: ResourceType;
    diceResults: ResourceType[];
  }[],
  multiplier: number = 1
) => {
  console.log('HARVEST', state, slots, multiplier);
  const resourcesAdded: number[] = [];
  for (const slot of slots) {
    const numHarvestResults = slot.diceResults.filter(
      r => r === ResourceType.DICE_GROW
    ).length;
    resourcesAdded.push(numHarvestResults);
    for (let i = 0; i < numHarvestResults * multiplier; i++) {
      state.res.push(slot.resourceType);
    }
  }
  setPrimaryResources(state.ui.res, state);

  return resourcesAdded;
};

export const gameGetDiceResult = (dice: DiceWithFaces) => {
  return randInArray(dice);
};

export const gameGetDiceResults = (diceList: DiceWithFaces[]) => {
  const results: ResourceType[] = [];
  for (const dice of diceList) {
    results.push(gameGetDiceResult(dice));
  }
  return results;
};

export const gameRollDiceUi = async (
  arr: { dice: DiceWithFaces; elem: Dice }[],
  reqs: ResourceType[],
  luck: boolean = false
) => {
  const results: ResourceType[] = [];
  const promises: Promise<void>[] = [];
  for (const d of arr) {
    const resultValue = luck ? reqs[0] : gameGetDiceResult(d.dice);

    promises.push(
      diceSpin(d.elem, resultValue, 600, 2).then(() => {
        const icon = Labels[resultValue].icon;
        diceSetFace(d.elem, icon);
        setStyle(d.elem.root, {
          borderColor: reqs.includes(resultValue) ? 'green' : 'red',
          background: reqs.includes(resultValue) ? 'green' : 'unset',
        });
      })
    );
    await timeoutPromise(250);

    results.push(resultValue);
  }
  await Promise.all(promises);
  return results;
};

export const gameSetupEvents = (state: GameState, events: GameEvent[]) => {
  const findEventByTitle = (title: string) => {
    return events.find(e => e.title === title);
  };
  const shuffleEvents = (events: GameEvent[]) => {
    return events.sort(() => Math.random() - 0.5);
  };
  const START_EVENT = findEventByTitle('The Game');
  const VILLAGER_CONTRACT_EVENT = findEventByTitle('Villager Contract');
  const BLACK_CAT_EVENT = findEventByTitle('The Black Cat');
  const ATTACK_EVENT = findEventByTitle('Attack!');
  const HERB_MERCHANT_EVENT = findEventByTitle('Herb Merchant');
  const END_EVENT = findEventByTitle('The End');
  EXPULSION_EVENT = findEventByTitle('Expulsion');
  const templateEvents = [
    START_EVENT,
    VILLAGER_CONTRACT_EVENT,
    BLACK_CAT_EVENT,
    ATTACK_EVENT,
    HERB_MERCHANT_EVENT,
    END_EVENT,
    EXPULSION_EVENT,
  ];

  const eventsToShuffle = events.filter(e => !templateEvents.includes(e));

  for (let i = 0; i < 7; i++) {
    const monsterName = randInArray(MONSTER_NAMES);
    const attackEvent = copyObject(ATTACK_EVENT);
    for (const child of attackEvent.children) {
      child.p = child.p?.replace('monster', '<b>' + monsterName + '</b>');
    }
    eventsToShuffle.splice(
      randInRange(0, eventsToShuffle.length - 1),
      0,
      attackEvent
    );
  }

  for (let i = 0; i < 4; i++) {
    const herbMerchantEvent = copyObject(HERB_MERCHANT_EVENT);
    eventsToShuffle.splice(
      randInRange(0, eventsToShuffle.length - 1),
      0,
      herbMerchantEvent
    );
  }

  const orderedEvents = shuffleEvents(eventsToShuffle);

  for (let i = 0; i < 4; i++) {
    const contractEvent = copyObject(VILLAGER_CONTRACT_EVENT);
    orderedEvents.splice(i * 7 + randInRange(0, 6), 0, contractEvent);
  }
  for (let i = 0; i < 4; i++) {
    const blackCatEvent = copyObject(BLACK_CAT_EVENT);
    orderedEvents.splice(i * 7 + 6, 0, blackCatEvent); // every Saturday
  }

  const startEventCopy = copyObject(START_EVENT);
  const continueChild = startEventCopy.children.slice(-2)[0];
  continueChild.mod = [
    '3 GOLD',
    '1 HERB_SPARKLEWEED',
    '1 HERB_BRAMBLEBERRY',
    '1 REAG_SKY_DUST',
    '1 REAG_SUN_POWDER',
    '1 POT_LIQUID_LUCK',
  ];
  // const randomPotion = randInArray(POTION_NAMES);
  // continueChild.mod.push('1 ' + randomPotion);

  const finalEvents = [startEventCopy, ...orderedEvents, END_EVENT];
  console.log('SETUP EVENTS', startEventCopy, finalEvents);
  state.events = finalEvents;
};

export const gameModifyResource = (
  state: GameState,
  gameEventState: GameEventState,
  child: GameEventChild,
  resource: ResourceType,
  amt: number
) => {
  const replaceDiceFace = (face1: ResourceType, face2: ResourceType) => {
    for (const dice of state.magicDice) {
      for (let i = 0; i < dice.length; i++) {
        if (dice[i] === face1) {
          dice[i] = face2;
        }
      }
    }
  };

  console.log(' modifying', resource, amt);
  if (resource === ResourceType.CONTRACT_VILLAGER) {
    const contractReturnEvent = createContractReturnEvent(gameEventState.event);
    const eventInd = state.events.indexOf(gameEventState.event);
    state.events.splice(eventInd + 7, 0, contractReturnEvent.event);
  } else if (resource === ResourceType.DICE_NEW) {
    state.magicDice.push(createMagicDice());
  } else if (resource === ResourceType.DICE_FIRE_MAGIC) {
    // replaceDiceFace(ResourceType.DICE_FIRE_MAGIC, ResourceType.DICE_HEART_MAGIC);
  } else if (resource === ResourceType.DICE_HEART_MAGIC) {
    replaceDiceFace(
      ResourceType.DICE_FIRE_MAGIC,
      ResourceType.DICE_HEART_MAGIC
    );
  } else if (resource === ResourceType.DICE_GROW) {
    replaceDiceFace(ResourceType.DICE_FIRE_MAGIC, ResourceType.DICE_GROW);
  } else if (resource === ResourceType.EFFECT_COLD) {
    // child.next = 'nextDay';
    timeoutPromise(1).then(() => {
      gameAdvanceDay(state, 'You take a day to rest and recover.');
    });
  } else {
    gameStateModifyResource(state, resource, amt);
    if (BLUEPRINT_NAMES.includes(resource)) {
      state.vars.avblBlueprints = state.vars.avblBlueprints.filter(
        blueprint => blueprint !== resource
      );
    }
  }
};
