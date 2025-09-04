import {
  domAddEventListener,
  appendChild,
  BUTTON,
  createElement,
  DIV,
  EVENT_CLICK,
  INNER_HTML,
  nextTick,
} from '../dom';
import { runEvent } from '../eventRunner';
import { GameState, gameStateHasHarvestRoll } from '../state';
// import { setGardenSlots } from './Garden';
import { setPrimaryResources } from './PrimaryResources';
import { CLASS_BTN_TEXT } from './style';

export interface NextBar {
  root: HTMLElement;
  nextButton?: HTMLElement;
}

export const createNextBar = (): NextBar => {
  const root = createElement(DIV, {
    class: 'next-bar flxcr',
  });

  return {
    root,
  };
};

export const nextBarSetButtonState = (nextBar: NextBar, state: GameState) => {
  nextBar.nextButton?.remove();
  if (gameStateHasHarvestRoll(state)) {
    const nextButton = createElement(BUTTON, {
      class: CLASS_BTN_TEXT + ' next-btn',
      [INNER_HTML]: 'Next Day',
    });
    nextBar.nextButton = nextButton;

    domAddEventListener(nextButton, EVENT_CLICK, () => {
      state.harvestRoll = [];
      state.day++;
      // setGardenSlots(state.ui.garden, state);
      setPrimaryResources(state.ui.res, state);
      nextTick(() => {
        nextBarSetButtonState(nextBar, state);
        runEvent(state, state.events[state.day]);
      });
    });

    appendChild(nextBar.root, nextButton);
  } else {
    const nextButton = createElement(BUTTON, {
      class: CLASS_BTN_TEXT + ' next-btn',
      [INNER_HTML]: 'Harvest',
    });
    nextBar.nextButton = nextButton;

    domAddEventListener(nextButton, EVENT_CLICK, () => {
      // gameHarvest(state);
    });

    appendChild(nextBar.root, nextButton);
  }
};
