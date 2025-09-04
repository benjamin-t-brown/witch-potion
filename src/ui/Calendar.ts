import { appendChild, createElement, DIV, INNER_HTML, setStyle } from '../dom';

export interface Calendar {
  root: HTMLElement;
  subRoot: HTMLElement;
  day: number;
}

const SQUARE_SIZE = 48;
const ACTIVE_DAY_CLASS = 'calendar-square-active';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const createCalendar = (days: number): Calendar => {
  const root = createElement(DIV, {});
  setStyle(root, {
    width: `${days * SQUARE_SIZE}px`,
  });

  const subRoot = createElement(DIV, {});
  setStyle(subRoot, {
    transition: 'transform 0.3s ease-in-out',
  });
  appendChild(root, subRoot);

  for (let i = 0; i < days; i++) {
    const square = createElement(DIV, {
      class: 'calendar-square',
      [INNER_HTML]: `${i + 1}. ${daysOfWeek[i % 7]}`,
    });
    appendChild(subRoot, square);
  }

  const calendar = {
    root,
    subRoot,
    day: 0,
  };
  return calendar;
};

export const calendarSetDay = (calendar: Calendar, day: number) => {
  calendar.day = day - 1;
  calendarAdvanceDayForward(calendar);

};

export const calendarAdvanceDayForward = (calendar: Calendar) => {
  calendar.day++;
  calendar.subRoot.style.transform = `translateX(-${
    calendar.day * SQUARE_SIZE
  }px)`;
  const activeChild = calendar.subRoot.children[calendar.day];
  if (activeChild) {
    activeChild.classList.add(ACTIVE_DAY_CLASS);
  }
  const prevChild = calendar.subRoot.children[calendar.day - 1];
  if (prevChild) {
    prevChild.classList.remove(ACTIVE_DAY_CLASS);
  }
};
