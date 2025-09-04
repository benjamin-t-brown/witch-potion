import { GameEventState } from './eventRunner';

export const defaultEventState: GameEventState = {
  /*@preserve*/
  event: {
    /*@preserve*/
    icon: '',
    /*@preserve*/
    title: '',
    /*@preserve*/
    children: [
      {
        /*@preserve*/
        id: 'harvest',
        /*@preserve*/
        type: 'garden',
        /*@preserve*/
        p: 'You may now harvest your garden.',
      },
      {
        /*@preserve*/
        re: true,
        /*@preserve*/
        id: 'day',
        /*@preserve*/
        type: 'choice',
        /*@preserve*/
        p: 'You are at your shop. What would you like to do today?',
        /*@preserve*/
        choices: [
          {
            /*@preserve*/
            text: 'Visit the reagent merchant.',
            /*@preserve*/
            next: 'merch',
          },
          {
            /*@preserve*/
            text: 'Mix potions.',
            /*@preserve*/
            next: 'pot',
          },
          {
            /*@preserve*/
            text: 'View inventory.',
            /*@preserve*/
            next: 'inv',
          },
          {
            /*@preserve*/
            text: 'End the day.',
            /*@preserve*/
            next: 'nextDay',
          },
        ],
      },
      {
        /*@preserve*/
        id: 'nextDay',
        /*@preserve*/
        type: 'end',
      },
      // {
      //   /*@preserve*/
      //   id: 'merch',
      //   /*@preserve*/
      //   type: 'choice',
      //   /*@preserve*/
      //   p: '"Buying or selling?" the merchant asks.',
      //   /*@preserve*/
      //   choices: [
      //     {
      //       /*@preserve*/
      //       text: 'Buying.',
      //       /*@preserve*/
      //       next: 'merchBuying',
      //     },
      //     {
      //       /*@preserve*/
      //       text: 'Selling.',
      //       /*@preserve*/
      //       next: 'merchSelling',
      //     },
      //     {
      //       /*@preserve*/
      //       text: 'Go back.',
      //       /*@preserve*/
      //       next: 'day',
      //     },
      //   ],
      // },
    ],
  },
  /*@preserve*/
  evalVars: {},
  /*@preserve*/
  currentChildId: 'default',
};
