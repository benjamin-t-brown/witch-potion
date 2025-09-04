import { GameState, gameStateGetResourceCount } from './state';
import {
  GameEventChoice,
  ResourceType,
  BUY_COSTS,
  HERB_NAMES,
  REAGENT_NAMES,
  POTION_NAMES,
  RECIPES,
  GameEvent,
} from './eventTypes';
import { createEventState, GameEventState } from './eventRunner';
import { CONDITION_DELIMITER } from './eventParser';

export const gameCreateMerchantEvents = (
  state: GameState,
  eventState: GameEventState
) => {
  const buyChoices: GameEventChoice[] = [];
  // const sellChoices: GameEventChoice[] = [];

  const buyCosts = { ...BUY_COSTS };

  // for (const res of state.vars.avblBlueprints) {
  //   buyCosts[res] = 10;
  // }

  // const sellCosts = {
  //   ...SELL_COSTS,
  // };

  for (const [res, cost] of Object.entries(buyCosts)) {
    buyChoices.push({
      text: `Buy 1 ${res} for ${cost} ${ResourceType.GOLD}`,
      next: 'buy_' + res,
      conditionText: `HAS(${cost} ${ResourceType.GOLD})`,
    });
    eventState.event.children.push({
      id: 'buy_' + res,
      type: 'modify',
      p: `You buy ${res} for ${cost} ${ResourceType.GOLD}.`,
      mod: [`-${cost} ${ResourceType.GOLD}`, `1 ${res}`],
      next: 'merch',
    });
  }

  for (const res of HERB_NAMES) {
    if (state.res.includes(res)) {
      buyChoices.push({
        text: `Sell 1 ${res} for 1 ${ResourceType.GOLD}`,
        next: 'sell_' + res,
        // conditionText: `HAS(1 ${res})`,
      });
      eventState.event.children.push({
        id: 'sell_' + res,
        type: 'modify',
        p: `You sell 1 ${res} for 1 ${ResourceType.GOLD}.`,
        mod: [`-1 ${res}`, `1 ${ResourceType.GOLD}`],
        next: 'merch',
        re: true
      });
    }
  }

  buyChoices.push({
    text: 'Go back.',
    next: 'day',
  });

  // for (const [res, cost] of Object.entries(sellCosts)) {
  //   if (state.res.includes(res as ResourceType)) {
  //     sellChoices.push({
  //       text: `Sell 1 ${res} for ${cost} ${
  //         ResourceType.GOLD
  //       }<br> (you own ${gameStateGetResourceCount(
  //         state,
  //         res as ResourceType
  //       )})`,
  //       next: 'sell_' + res,
  //     });
  //     eventState.event.children.push({
  //       id: 'sell_' + res,
  //       type: 'modify',
  //       p: `You sell ${res} for ${cost} ${ResourceType.GOLD}.`,
  //       mod: [`-1 ${res}`, `${cost} ${ResourceType.GOLD}`],
  //       next: 'merchSelling',
  //       /*@preserve*/
  //       re: true,
  //     });
  //   }
  // }

  // sellChoices.push({
  //   text: 'Go back.',
  //   next: 'day',
  // });

  eventState.event.children.push(
    {
      /*@preserve*/
      id: 'merch',
      /*@preserve*/
      type: 'choice',
      /*@preserve*/
      p: '"What\'re you buying?"',
      /*@preserve*/
      choices: buyChoices,
    }
    // {
    //   /*@preserve*/
    //   id: 'merchSelling',
    //   /*@preserve*/
    //   type: 'choice',
    //   /*@preserve*/
    //   p: 'You rummage in your pack for wares to sell.',
    //   /*@preserve*/
    //   choices: sellChoices,
    // }
  );
};

export const gameCreateBrewingEvents = (
  state: GameState,
  eventState: GameEventState
) => {
  const choices: GameEventChoice[] = [];
  const herbsAndReagents = [...HERB_NAMES, ...REAGENT_NAMES];

  const recipes = { ...RECIPES };
  for (const [res, recipe] of Object.entries(recipes)) {
    const amounts: string[] = [];
    for (const potentialIngredient of herbsAndReagents) {
      const amt = recipe.filter(r => r === potentialIngredient).length;
      if (amt > 0) {
        amounts.push(`${amt} ${potentialIngredient}`);
      }
    }
    const numOwned = gameStateGetResourceCount(state, res as ResourceType);
    choices.push({
      text: `Brew 1 ${res} (${numOwned}) for <br>${amounts.join('<br>')}`,
      next: 'brew_' + res,
      conditionText: amounts.map(a => `HAS(${a})`).join(CONDITION_DELIMITER),
    });
    eventState.event.children.push({
      id: 'brew_' + res,
      type: 'modify',
      p: `You make a ${res}.`,
      mod: [...amounts.map(a => `-${a}`), `1 ${res}`],
      next: 'pot',
      /*@preserve*/
      re: true,
    });
  }

  choices.push({
    /*@preserve*/
    text: 'Go back.',
    /*@preserve*/
    next: 'day',
  });

  eventState.event.children.push({
    /*@preserve*/
    id: 'pot',
    /*@preserve*/
    type: 'choice',
    /*@preserve*/
    p: 'At the mixing table you can concoct magical potions.',
    /*@preserve*/
    choices,
  });
};

export const gameCreateViewInventoryEvents = (
  state: GameState,
  eventState: GameEventState
) => {
  const resAndCounts = POTION_NAMES.map(res => ({
    res,
    count: gameStateGetResourceCount(state, res),
  }));

  eventState.event.children.push({
    /*@preserve*/
    id: 'inv',
    /*@preserve*/
    type: 'modify',
    /*@preserve*/
    p:
      "Here's what you have:" +
      resAndCounts.map(r => ` <br>${r.res} (${r.count})`).join(''),
    /*@preserve*/
    next: 'day',
  });
};

export const createContractReturnEvent = (contractEvent: GameEvent) => {
  const potionName = contractEvent.vars['@A'].parsed as string;
  const eventState = createEventState({
    title: 'The villager returns',
    icon: '📜',
    children: [
      {
        id: '0',
        type: 'choice',
        p:
          'The villager from last week returns to collect their promised potion:<br>' +
          potionName,
        choices: [
          {
            text: 'Give them the potion.',
            next: '1',
            conditionText: `HAS(${potionName})`,
          },
          {
            text: 'Say you cannot help. The Black Cat will be most displeased.',
            next: '2',
          },
        ],
      },
      {
        id: '1',
        type: 'modify',
        p: 'You sell the potion to the villager.',
        mod: [`-${potionName}`, '3 GOLD'],
        next: 'e',
      },
      {
        id: '2',
        type: 'modify',
        p: 'The disappointed villager leaves.',
        mod: [`-2 FAVOR_CAT`],
        next: 'e',
      },
    ],
  });
  return eventState;
};
