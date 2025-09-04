import { defaultEventState } from './defaultEvent';
import { appendChild, copyObject, getGameRoot } from './dom';
import { CONDITION_DELIMITER } from './eventParser';
import {
  ConditionFunc,
  GameEvent,
  GameEventChild,
  HERB_NAMES,
  HERB_TIER_1_NAMES,
  HERB_TIER_2_NAMES,
  Labels,
  POTION_NAMES,
  REAGENT_NAMES,
  REAGENT_TIER_1_NAMES,
  REAGENT_TIER_2_NAMES,
  ResourceType,
  ResourceTypeFunc,
} from './eventTypes';
import { gameAdvanceDay, gameModifyResource } from './game';
import {
  gameCreateViewInventoryEvents,
  gameCreateBrewingEvents,
  gameCreateMerchantEvents,
} from './generatedEvents';
import {
  GameState,
  gameStateGetResourceCount,
  gameStateHasResource,
  stringToResourceType,
} from './state';
import {
  createEventModal,
  eventModalAddChild,
  eventModalAddTitle,
} from './ui/EventModal';
import { setFavorMeterPct } from './ui/FavorMeter';
import { highlightText } from './ui/HoverDescription';
import { setPrimaryResources } from './ui/PrimaryResources';
import { COLOR_HIGHLIGHT_DARK_TEXT } from './ui/style';
import { randInArray, randInRange, splitDelimTrim } from './utils';

export interface GameEventState {
  event: GameEvent;
  evalVars: Record<string, string>;
  currentChildId: string;
}

export const runEvent = (state: GameState, event: GameEvent) => {
  const eventState = createEventState(event);
  evaluateVars(state, eventState, event);
  replaceVars(eventState, event);
  let modal = state.ui.eventModal;
  if (!modal) {
    modal = createEventModal(eventState);
    appendChild(getGameRoot(), modal.root);
  } else {
    eventModalAddTitle(modal, eventState);
  }
  state.ui.eventModal = modal;
  console.log('run event', event);
  gameEventRunChild(
    state,
    eventState,
    gameEventGetChild(eventState, eventState.currentChildId)
  );
};

export const gameEventRunChild = (
  state: GameState,
  eventState: GameEventState,
  child: GameEventChild
) => {
  const modal = state.ui.eventModal;
  if (!modal) {
    throw new Error('Cannot run child: No event modal found');
  }

  if (child.type === 'end') {
    if (child.id === 'nextDay') {
      gameAdvanceDay(state);
    } else if (child.id === 'eIntro') {
      state.day = 0;
      gameAdvanceDay(state, 'Tomorrow you start your first day as a witch.');
      return;
    } else {
      // run default event
      const newEventState = copyObject(defaultEventState);
      gameCreateMerchantEvents(state, newEventState);
      gameCreateBrewingEvents(state, newEventState);
      gameCreateViewInventoryEvents(state, newEventState);
      gameEventRunChild(state, newEventState, newEventState.event.children[0]);
    }
    return;
  }

  if (child.p) {
    child.p = gameEventReplaceEnumWithIcons(child.p, COLOR_HIGHLIGHT_DARK_TEXT);
  }

  if (child.choices) {
    for (const choice of child.choices) {
      choice.text = gameEventReplaceEnumWithIcons(
        choice.text,
        COLOR_HIGHLIGHT_DARK_TEXT
      );
      if (!choice.parsedCondition) {
        choice.parsedCondition = gameEventParseCondition(
          state,
          eventState,
          choice.conditionText
        );
      }
    }
  }

  if (child.rolls) {
    child.parsedRolls = [];
    for (const roll of child.rolls) {
      const [amt, resource] = parseAmountAndResource(roll);
      for (let i = 0; i < amt; i++) {
        child.parsedRolls.push(resource);
      }
    }
  }

  if (child.mod) {
    child.parsedMod = [];
    for (const modifyResource of child.mod) {
      const [amt, resource] = parseAmountAndResource(modifyResource);
      child.parsedMod.push({
        amt,
        resource,
      });
      gameModifyResource(state, eventState, child, resource, amt);
    }
  }

  if (child.re) {
    console.log('re generating event state');
    // generate default event
    eventState = copyObject(defaultEventState);
    gameCreateMerchantEvents(state, eventState);
    gameCreateBrewingEvents(state, eventState);
    gameCreateViewInventoryEvents(state, eventState);
  }

  eventModalAddChild(modal, child, eventState, state);
  setPrimaryResources(state.ui.res!, state);
  setFavorMeterPct(
    state.ui.favorMeter!,
    gameStateGetResourceCount(state, ResourceType.FAVOR_CAT)
  );
};

export const gameEventGetChild = (
  eventState: GameEventState,
  childId: string
): GameEventChild => {
  if (childId === 'e') {
    return {
      id: 'e',
      type: 'end',
    };
  }

  const child = eventState.event.children.find(child => child.id === childId);
  if (!child) {
    throw new Error(
      `Cannot getChild: Child with id ${childId} not found in event ${eventState.event.title}`
    );
  }
  return child;
};

export const createEventState = (event: GameEvent): GameEventState => {
  return {
    event,
    currentChildId: event.children[0].id,
    evalVars: {},
  };
};

export const gameEventParseResourceFunc2 = (
  text: string,
  func: string,
  args: string[],
  state: GameState
): [number, ResourceType] => {
  // console.log('parse resource func', text, func, args);
  const _parseAmt = (amtText: string) => {
    if (amtText.includes('RAND')) {
      const spl = amtText.slice(4).split('_');
      const amtLower = parseInt(spl[0]);
      const amtUpper = parseInt(spl[1]);
      if (isNaN(amtLower) || isNaN(amtUpper)) {
        throw new Error(`Invalid RAND amount: ${amtText}`);
      }
      return randInRange(amtLower, amtUpper);
    }

    const amt = parseInt(amtText);
    if (isNaN(amt)) {
      throw new Error(`Invalid ARG amount: ${amtText}`);
    }
    return amt;
  };
  const _parseArgsForAmtFunc = (
    resList: ResourceType[]
  ): [number, ResourceType] => {
    let amt = _parseAmt(args[0]);
    const requireExist = args[1] === 'y';
    let resToReturn: ResourceType[] = [];
    while (resToReturn.length === 0 && amt > 0) {
      resToReturn = requireExist
        ? resList.filter(herb => gameStateHasResource(state, herb, amt))
        : resList;
      amt--;
    }
    if (resToReturn.length === 0) {
      console.log('No resources found for', func, args);
      return [0, ResourceType.GOLD];
    }
    return [amt + 1, randInArray(resToReturn)];
  };

  const funcResults = {
    [ResourceTypeFunc.FUNC_RANDOM_HERB_TIER_1]: () => {
      return _parseArgsForAmtFunc(HERB_TIER_1_NAMES);
    },
    [ResourceTypeFunc.FUNC_RANDOM_HERB_TIER_2]: () => {
      return _parseArgsForAmtFunc(HERB_TIER_2_NAMES);
    },
    [ResourceTypeFunc.FUNC_RANDOM_HERB_ANY]: () => {
      return _parseArgsForAmtFunc(HERB_NAMES);
    },
    [ResourceTypeFunc.FUNC_RANDOM_REAGENT_TIER_1]: () => {
      return _parseArgsForAmtFunc(REAGENT_TIER_1_NAMES);
    },
    [ResourceTypeFunc.FUNC_RANDOM_REAGENT_TIER_2]: () => {
      return _parseArgsForAmtFunc(REAGENT_TIER_2_NAMES);
    },
    [ResourceTypeFunc.FUNC_RANDOM_REAGENT_ANY]: () => {
      return _parseArgsForAmtFunc(REAGENT_NAMES);
    },
    [ResourceTypeFunc.FUNC_RANDOM_POTION_TIER_1]: () => {
      return _parseArgsForAmtFunc(
        POTION_NAMES.filter(p => p !== ResourceType.POT_LIQUID_LUCK)
      );
    },
    [ResourceTypeFunc.FUNC_RANDOM_POTION_ANY]: () => {
      return _parseArgsForAmtFunc(POTION_NAMES);
    },
    [ResourceTypeFunc.FUNC_RANDOM_GOLD]: () => {
      return _parseArgsForAmtFunc([ResourceType.GOLD]);
    },
    [ResourceTypeFunc.FUNC_RANDOM_FIRE_MAGIC]: () => {
      return _parseArgsForAmtFunc([ResourceType.DICE_FIRE_MAGIC]);
    },
    [ResourceTypeFunc.FUNC_RANDOM_HEART_MAGIC]: () => {
      return _parseArgsForAmtFunc([ResourceType.DICE_HEART_MAGIC]);
    },
    [ResourceTypeFunc.FUNC_RANDOM_GROW]: () => {
      return _parseArgsForAmtFunc([ResourceType.DICE_GROW]);
    },
  };

  const funcResult = funcResults[func];
  if (funcResult) {
    return funcResult();
  }

  throw new Error(
    `Unknown resource function: "${func}" after parsing "${text}"`
  );
};

export const gameEventReplaceEnumWithIcons = (
  text: string,
  highlightColor: string
): string => {
  let result = text;

  // checking "has this function modified this text already?"
  if (text.includes('<span')) {
    return text;
  }

  // ResourceType -> enumName
  const obj: Record<string, string> = {};
  for (const [enumName, enumValue] of Object.entries(ResourceType)) {
    obj[enumValue] = enumName;
  }

  for (const [enumValue, enumName] of Object.entries(obj)) {
    const labelObj = Labels[enumValue];
    if (!labelObj) {
      throw new Error(`Unknown enum value: ${enumValue}`);
    }
    const label = highlightText(labelObj.l, highlightColor);
    // if (DICE_NAMES.includes(enumValue as ResourceType)) {
    //   label = '';
    // }
    const replacement = `${label}${Labels[enumValue].icon}`;
    result = result.replaceAll(enumName, replacement);
  }

  return result;
};

export const gameEventParseCondition = (
  state: GameState,
  gameEventState: GameEventState,
  conditionString: string | undefined
): (() => boolean) => {
  if (!conditionString) {
    return () => true;
  }
  const arr = splitDelimTrim(conditionString, CONDITION_DELIMITER);
  const resFuncs: (() => boolean)[] = [];
  for (const cond of arr) {
    const _parseHasResource = (str: string) => {
      const arr = parseFunc(str, ConditionFunc.HAS_RESOURCE);
      if (!arr) {
        return;
      }
      const [amt, resource] = parseAmountAndResource(arr[1].join(' '));
      return () => {
        return gameStateHasResource(state, resource, amt);
      };
    };

    const hasResource = _parseHasResource(cond);
    if (hasResource) {
      resFuncs.push(hasResource);
    }
  }

  if (resFuncs.length === 0) {
    throw new Error(`Unknown condition format: ${conditionString}`);
  }
  return () => {
    return resFuncs.every(func => func());
  };
};

const replaceVarsInText = (text: string, evalVars: Record<string, string>) => {
  for (const [varName, varValue] of Object.entries(evalVars)) {
    text = text.replaceAll(varName, varValue);
  }
  return text;
};

const parseAmountAndResource = (text: string): [number, ResourceType] => {
  const arr = text.split(' ');
  if (arr.length === 2) {
    // if (arr[1] === 'ANY') {
    //   return [1, 'ANY'];
    // }
    return [parseInt(arr[0]), stringToResourceType(arr[1])];
  }
  return [1, ResourceType.GOLD];
};

const parseFunc = (
  text: string,
  expectedFunc?: string
): [string, string[], string] | undefined => {
  const match = text.match(
    new RegExp(`(${expectedFunc ?? '.*'})\\(([^)]*)\\)`)
  );
  if (match) {
    let func = match[1];
    if (func[0] === '-') {
      func = func.slice(1);
    }
    const args = splitDelimTrim(match[2], ' ');
    return [func, args, match[0]];
  }
};

const evaluateVars = (
  state: GameState,
  eventState: GameEventState,
  event: GameEvent
) => {
  for (const varName in event.vars) {
    const obj = event.vars[varName];
    const parsedFunc = parseFunc(obj.str);
    if (parsedFunc) {
      const existingParsed = eventState.evalVars[varName];
      if (existingParsed) {
        obj.parsed = existingParsed;
        continue;
      }
      const [func, args, fullMatch] = parsedFunc;
      const [amt, resourceName] = gameEventParseResourceFunc2(
        fullMatch,
        func,
        args,
        state
      );
      const str = amt + ' ' + resourceName;
      obj.parsed = str;
      eventState.evalVars[varName] = str;
    } else {
      obj.parsed = obj.str;
      eventState.evalVars[varName] = obj.str;
    }
  }
};

const replaceVars = (eventState: GameEventState, event: GameEvent) => {
  for (const child of event.children) {
    if (child.p) {
      child.p = replaceVarsInText(child.p, eventState.evalVars);
    }
    if (child.choices) {
      for (const choice of child.choices) {
        choice.text = replaceVarsInText(choice.text, eventState.evalVars);
        if (choice.conditionText) {
          choice.conditionText = replaceVarsInText(
            choice.conditionText,
            eventState.evalVars
          );
        }
      }
    }
    if (child.rolls) {
      for (let i = 0; i < child.rolls.length; i++) {
        const roll = child.rolls[i];
        child.rolls[i] = replaceVarsInText(roll, eventState.evalVars);
      }
    }
    if (child.mod) {
      for (let i = 0; i < child.mod.length; i++) {
        const mod = child.mod[i];
        child.mod[i] = replaceVarsInText(mod, eventState.evalVars);
      }
    }
  }
};
