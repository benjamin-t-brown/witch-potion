import { appendChild, createElement, DIV } from '../dom';
import { createFavorMeter, FavorMeter, setFavorMeterPct } from './FavorMeter';

interface BottomBar {
  root: HTMLElement;
  favorMeter: FavorMeter;
}

export const createBottomBar = (): BottomBar => {
  const root = createElement(DIV, {
    class: 'bottom-bar flxcr',
  });

  const favorMeter = createFavorMeter();  
  appendChild(root, favorMeter.root);
  setFavorMeterPct(favorMeter, 5);

  return {
    root,
    favorMeter,
  };
};
