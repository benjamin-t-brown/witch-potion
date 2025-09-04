import {
  createElement,
  DIV,
  appendChild,
  INNER_HTML,
  clearChildren,
  setStyle,
} from '../dom';
import { ICON_CAT } from '../eventTypes';

export interface FavorMeter {
  root: HTMLElement;
  subRoot: HTMLElement;
}

export const MAX_FAVOR = 10;

export const createFavorMeter = (): FavorMeter => {
  const root = createElement(DIV, {
    class: 'favor-meter',
  });
  const label = createElement(DIV, {
    [INNER_HTML]: "Black Cat's Favor",
  });
  appendChild(root, label);
  const subRoot = createElement(DIV, {
    class: 'favor-meter-sub',
  });
  setStyle(root, {
    width: `${MAX_FAVOR * 24}px`,
  });
  appendChild(root, subRoot);
  return { root, subRoot };
};

export const setFavorMeterPct = (
  favorMeter: FavorMeter,
  numCatsFavor: number
) => {
  clearChildren(favorMeter.subRoot);
  for (let i = 0; i < Math.min(MAX_FAVOR, numCatsFavor); i++) {
    const cat = createElement(DIV, {
      [INNER_HTML]: ICON_CAT,
    });
    appendChild(favorMeter.subRoot, cat);
  }
};
