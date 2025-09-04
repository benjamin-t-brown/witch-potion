import { appendChild, getGameRoot } from './dom';
import { parseEvents } from './eventParser';
import { runEvent } from './eventRunner';
import { ResourceType } from './eventTypes';
import { gameSetupEvents } from './game';


import { createGameState } from './state';
import { createBottomBar } from './ui/BottomBar';
import { calendarSetDay, createCalendar } from './ui/Calendar';
import {
  createHoverDescription,
  hoverDescriptionDescribe,
} from './ui/HoverDescription';
import {
  createPrimaryResources,
  setPrimaryResources,
} from './ui/PrimaryResources';

const eventString = `
#Disgruntled Customer,generic
@A=HEART(RAND2_3)
@B=POT1(1)
@C=POT1(1 y)
@D=FIRE(RAND1_3)
@E=GOLD(RAND2_4)
@F=3 GOLD
>0,choice
  +p: An angry customer shoves a potion in your face. "It doesn't work!" she claims.  "I need a refund!"  You see right away this potion is fake.  You didn't sell this...
  +c: 1|Kindly explain to her that you didn't sell this potion.  Maybe she'll calm down and leave?  A little magic could help too... @A
  +c: 2|Give her a replacement potion on the house.  The fake one looks like it's similar to @B.|HAS(@B)
  +c: 3|Demand that she leave at once! You're not going to get scammed with this.
>1,dice
  +p: As you explain, you attempt to placate her with your magic.
  +dice: @A
  +pass: 1pass
  +fail: 1fail
>1pass,modify
  +p: Your soothing words calm her down and she leaves without fanfare.
  +next: e
>1fail,modify
  +p: Uh oh.  She throws an absolute conniption that results in the fake potion shattering on the floor, damaging some of your wares.  Then she storms out.
  +rem: @C
  +next: e
>2,modify
  +p: She grumpily accepts your replacement.
  +rem: @B
  +next: e
>3,choice
  +p: A furrowed brow, a tilted chin, a clenched fist.  These are the signs of impending violence...
  +c: 3fight|Ready your magic.  This could get ugly... @D
  +c: 3relent|Relent and give her the replacement @B and a little extra @E for good measure.|HAS(@B),HAS(@E)
  +c: 3relent2|Relent and give her a fair refund @F|HAS(@F)
>3fight,dice
  +p: You cast a spell to intimidate her.
  +dice: @D
  +pass: 3fightpass
  +fail: 1fail
>3fightpass,modify
  +p: She screams in terror, throws the foreign potion at the ground where it shatters, and retreats gracelessly from your shop
  +next: e
>3relent,modify
  +p: You hand over @B and @E.  She huffs at you in indignation, but leaves.
  +rem: @B
  +rem: @E
  +next: e
>3relent2,modify
  +p: You shell out @F. With a smug grin, the customer snatches the purse and leaves.
  +rem: @F
  +next: e
`;

addEventListener('load', async () => {
  const gameState = createGameState();
  (window as any).state = gameState;
  const calendar = createCalendar(30);
  appendChild(getGameRoot(), calendar.root);
  gameState.ui.calendar = calendar;

  const primaryResources = createPrimaryResources();
  gameState.ui.res = primaryResources;
  appendChild(getGameRoot(), primaryResources.root);
  setPrimaryResources(primaryResources, gameState);

  // const nextBar = createNextBar();
  // gameState.ui.nextBar = nextBar;
  // appendChild(getGameRoot(), nextBar.root);
  // nextBarSetButtonState(nextBar, gameState);

  // const garden = createGarden();
  // gameState.ui.garden = garden;
  // appendChild(getGameRoot(), garden.root);
  // setGardenSlots(garden, gameState);
  // setGardenSlots(garden, gameState);
  // updateBlueprintList(garden, gameState);

  const hoverDescription = createHoverDescription();
  appendChild(getGameRoot(), hoverDescription.root);
  hoverDescriptionDescribe(hoverDescription, ResourceType.DICE_FIRE_MAGIC);
  gameState.ui.hoverDescription = hoverDescription;

  const bottomBar = createBottomBar();
  appendChild(getGameRoot(), bottomBar.root);
  gameState.ui.favorMeter = bottomBar.favorMeter;

  const eventsTxt = await fetch('/events.wpe').then(r => r.text());
  const gameEvents = parseEvents(eventsTxt);
  gameSetupEvents(gameState, gameEvents);
  // const gameEvents2 = parseEvents(eventString);
  // console.log('parsed events',copyObject(gameEvents));
  console.log('game events', gameState.events);
  gameState.day = 0;
  calendarSetDay(gameState.ui.calendar, 0);

  // gameState.res.push(
  //   ResourceType.POT_GROWTH,
  //   ResourceType.POT_POWER_POTION,
  //   ResourceType.POT_EMPATHY
  // );
  for (let i = 0; i < 5; i++) {
    gameState.res.push(ResourceType.FAVOR_CAT);
  }

  runEvent(gameState, gameState.events[0]);
  // runEvent(gameState, gameEvents.find(e => e.title.includes('Wizard'))!);

  // debug default event state
  // const newEventState = copyObject(defaultEventState);
  // gameCreateMerchantEvents(gameState, newEventState);
  // gameCreateBrewingEvents(gameState, newEventState);
  // gameCreateViewInventoryEvents(gameState, newEventState);
  // let modal = gameState.ui.eventModal;
  // if (!modal) {
  //   modal = createEventModal(newEventState);
  //   appendChild(getGameRoot(), modal.root);
  // }
  // gameState.ui.eventModal = modal;
  // console.log('run event', newEventState.event);
  // gameEventRunChild(gameState, newEventState, newEventState.event.children[1]);
});
