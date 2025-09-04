import {
  appendChild,
  clearChildren,
  createElement,
  DIV,
  getElementsByClassName,
  INNER_HTML,
  setStyle,
  SPAN,
} from '../dom';
import { getResourceFromLabel, Labels, ResourceType } from '../eventTypes';
import { DiceWithFaces, getCurrentState } from '../state';

export const highlightText = (text: string, color: string) => {
  const resource = getResourceFromLabel(text);
  const cbFuncName = `hl('${resource}', this)`;
  // console.log('Highlight', text, resource, cbFuncName);
  return `<${SPAN} class="highlight-text" style="color: ${color};" onclick="${cbFuncName}" onmouseover="${cbFuncName}" onmouseout="${cbFuncName}" >${text}</${SPAN}>`;
};

(window as any).hl = (resource: ResourceType, elem: HTMLElement) => {
  // console.log('HL TEXT', resource);

  const cl = 'highlight-text';
  const allElementsWithClass = getElementsByClassName(cl);
  for (const elem of allElementsWithClass) {
    setStyle(elem as HTMLElement, { 'text-decoration': 'none' });
  }
  setStyle(elem as HTMLElement, { 'text-decoration': 'underline' });
  const hoverDescription = getCurrentState().ui.hoverDescription;
  hoverDescriptionDescribe(hoverDescription, resource);
};

export const highlightResource = (resource: ResourceType, color: string) => {
  const labelObj = Labels[resource];
  return highlightText(labelObj.l, color) + labelObj.icon;
};

export interface HoverDescription {
  root: HTMLElement;
}

export const createHoverDescription = (): HoverDescription => {
  const root = createElement(DIV, {
    class: 'hover-desc',
  });
  return { root };
};

export const hoverDescriptionDescribe = (
  hoverDescription: HoverDescription,
  resource: ResourceType
) => {
  const labelObj = Labels[resource];
  clearChildren(hoverDescription.root);
  const label = createElement(SPAN, {
    class: 'hover-desc-label',
    [INNER_HTML]: labelObj.l + labelObj.icon + ': ',
  });
  appendChild(hoverDescription.root, label);

  const dsc = createElement(SPAN, {
    class: 'hover-desc-dsc',
    [INNER_HTML]: labelObj.dsc,
  });
  appendChild(hoverDescription.root, dsc);
};

export const hoverDescriptionDescribeShowDice = (
  hoverDescription: HoverDescription,
  magicDice: DiceWithFaces
) => {
  clearChildren(hoverDescription.root);
  const container = createElement(DIV, {
    class: 'flxcr',
  });
  setStyle(container, {
    height: '48px',
  });
  for (const face of magicDice) {
    const labelObj = Labels[face];
    const label = createElement(DIV, {
      class: 'dice flxcr',
      [INNER_HTML]: labelObj.icon,
    });
    setStyle(label, {
      display: 'inline-flex',
    });
    appendChild(container, label);
  }
  appendChild(hoverDescription.root, container);
};
