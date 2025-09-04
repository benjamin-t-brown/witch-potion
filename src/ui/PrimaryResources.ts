import { appendChild, clearChildren, createElement, DIV, INNER_HTML } from '../dom';
import {
  HERB_NAMES,
  Labels,
  REAGENT_NAMES,
  ResourceType,
} from '../eventTypes';
import { GameState, gameStateGetResourceCount } from '../state';
import { highlightText } from './HoverDescription';

export interface PrimaryResources {
  root: HTMLElement;
  herbRoot: HTMLElement;
  otherRoot: HTMLElement;
}

export const createPrimaryResources = (): PrimaryResources => {
  const root = createElement(DIV, {
    id: 'primary-resources',
  });
  const herbRoot = createElement(DIV, {
    class: 'primary-resource-column',
  });
  appendChild(root, herbRoot);

  const otherRoot = createElement(DIV, {
    class: 'primary-resource-column',
  });
  appendChild(root, otherRoot);

  return {
    root,
    herbRoot,
    otherRoot,
  };
};

export const setPrimaryResources = (
  primaryResources: PrimaryResources,
  state: GameState
) => {
  clearChildren(primaryResources.herbRoot);
  clearChildren(primaryResources.otherRoot);

  for (const res of HERB_NAMES) {
    const labelObj = Labels[res];
    const herbRow = createElement(
      DIV,
      {
        class: 'flxcr primary-resource-row',
      },
      [
        createElement(DIV, {
          [INNER_HTML]:
            highlightText(labelObj.icon + labelObj.l, '#1b631b') + ': ',
        }),
        createElement(DIV, {
          [INNER_HTML]: String(gameStateGetResourceCount(state, res)),
        }),
      ]
    );
    appendChild(primaryResources.herbRoot, herbRow);
  }

  const otherNames = [...REAGENT_NAMES, ResourceType.GOLD];

  for (const res of otherNames) {
    const labelObj = Labels[res];
    const otherRow = createElement(DIV, {
      class: 'flxcr primary-resource-row',
    }, [
      createElement(DIV, {
        [INNER_HTML]: highlightText(labelObj.icon + labelObj.l, '#009') + ': ',
      }),
      createElement(DIV, {
        [INNER_HTML]: String(gameStateGetResourceCount(state, res)),
      }),
    ]);
    appendChild(primaryResources.otherRoot, otherRow);
  }
};
