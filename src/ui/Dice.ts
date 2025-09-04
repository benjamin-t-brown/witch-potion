import {
  appendChild,
  domAddEventListener,
  createElement,
  DIV,
  EVENT_CLICK,
  INNER_HTML,
  setStyle,
  EVENT_MOUSE_OVER,
  SPAN,
} from '../dom';
import { DiceWithFaces, GameState } from '../state';
import { hoverDescriptionDescribeShowDice } from './HoverDescription';

export interface Dice {
  root: HTMLElement;
  subRoot: HTMLElement;
}

export const DICE_DEFAULT_FACE = `<${SPAN} class="icon">❓</${SPAN}>`;

export const createDice = (
  state: GameState,
  magicDice: DiceWithFaces,
  face = DICE_DEFAULT_FACE
) => {
  const root = createElement(DIV, {
    class: 'dice',
  });
  const onHover = () => {
    hoverDescriptionDescribeShowDice(state.ui.hoverDescription, magicDice);
  };
  domAddEventListener(root, EVENT_CLICK, onHover);
  domAddEventListener(root, EVENT_MOUSE_OVER, onHover);

  const subRoot = createElement(DIV, {
    class: 'flxcr wh',
    [INNER_HTML]: face,
  });
  appendChild(root, subRoot);

  return {
    root,
    subRoot,
  };
};

export const diceSetFace = (dice: Dice, face: string) => {
  dice.subRoot[INNER_HTML] = face;
};

export const diceSpin = (
  dice: Dice,
  resultValue: string,
  ms: number,
  rotations: number
) => {
  return new Promise<void>(resolve => {
    setStyle(dice.root, {
      animation: `spin ${ms / rotations}ms linear ${rotations}`,
    });
    diceSetFace(dice, DICE_DEFAULT_FACE);
    setTimeout(() => {
      setStyle(dice.root, {
        animation: '',
      });
      diceSetFace(dice, resultValue);
      resolve();
    }, ms);
  });
};
