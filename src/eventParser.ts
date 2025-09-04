import {
  type GameEvent,
  type GameEventChild,
  type GameEventChoice,
} from './eventTypes';
import { splitDelimTrim } from './utils';

export const ARG_DELIMITER = '|';
export const CONDITION_DELIMITER = ',';

export class EventParser {
  lines: string[] = [];
  currentLine: number = 0;

  parseMultipleEvents(eventsString: string): GameEvent[] {
    const events: GameEvent[] = [];

    const lines = eventsString.trim().split('\n');
    let currentEventLines: string[] = [];

    const _parseEvent = (eventString: string) => {
      try {
        const event = this.parseEventString(eventString);
        events.push(event);
      } catch (error) {
        console.warn('Failed to parse last event:', error);
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('#') && currentEventLines.length > 0) {
        const currentEventString = currentEventLines.join('\n');
        _parseEvent(currentEventString);
        currentEventLines = [trimmedLine];
      } else {
        currentEventLines.push(trimmedLine);
      }
    }

    if (currentEventLines.length > 0) {
      const lastEventString = currentEventLines.join('\n');
      _parseEvent(lastEventString);
    }

    return events;
  }

  parseEventString(eventString: string): GameEvent {
    this.lines = splitDelimTrim(eventString.trim(), '\n').filter(
      line => line.length > 0
    );
    this.currentLine = 0;

    const headerLine = this.lines[this.currentLine];
    if (!headerLine.startsWith('#')) {
      throw new Error('Event must start with # followed by title and icon');
    }

    const headerMatch = headerLine.match(/^#(.+?),(.+)$/);
    if (!headerMatch) {
      throw new Error('Invalid header format. Expected: #Title,icon_name');
    }

    const title = headerMatch[1].trim();
    const icon = headerMatch[2].trim();
    this.currentLine++;

    const children: GameEventChild[] = [];
    const event: GameEvent = {
      title,
      icon,
      children,
      vars: {},
    };
    while (this.currentLine < this.lines.length) {
      const child = this.parseChild(event);
      if (child) {
        children.push(child);
      }
    }

    return event;
  }

  parseChild(event: GameEvent): GameEventChild | null {
    if (this.currentLine >= this.lines.length) {
      return null;
    }

    const line = this.lines[this.currentLine];

    if (line.startsWith('@')) {
      const varMatch = line.match(/^(@.+)=(.+)$/);
      if (!varMatch) {
        throw new Error(`Invalid variable format: ${line}`);
      }
      const varName = varMatch[1].trim();
      const varValue = varMatch[2].trim();
      event.vars[varName] = {
        str: varValue,
        parsed: undefined,
      };
      this.currentLine++;
      return null;
    }

    if (!line.startsWith('>')) {
      this.currentLine++;
      return null;
    }

    const childMatch = line.match(/^>([\d\w]+|[a-z]),(\w+):?$/);
    if (!childMatch) {
      throw new Error(
        `Invalid child format at line ${this.currentLine + 1}: ${line}`
      );
    }

    const id = childMatch[1];
    const type = childMatch[2] as 'choice' | 'roll' | 'end' | 'modify';
    this.currentLine++;

    const child: GameEventChild = { id, type };

    while (this.currentLine < this.lines.length) {
      const contentLine = this.lines[this.currentLine];

      if (contentLine.startsWith('>')) {
        break;
      }

      if (contentLine.startsWith('+p:')) {
        const text = contentLine.substring(3).trim();
        child.p = text;
      } else if (contentLine.startsWith('+c:')) {
        if (child.type !== 'choice') {
          throw new Error(`Cannot add choice to non-choice child: ${child.id}`);
        }
        if (!child.choices) {
          child.choices = [];
        }
        const text = contentLine;
        const choice = this.parseChoice(text);
        child.choices.push(choice);
      } else if (contentLine.startsWith('+dice:')) {
        if (!child.rolls) {
          child.rolls = [];
        }
        const dice = this.parseDice(contentLine);
        child.rolls.push(...dice);
      } else if (contentLine.startsWith('+pass:')) {
        const passNode = contentLine.substring(6).trim();
        child.pass = passNode;
      } else if (contentLine.startsWith('+fail:')) {
        const failNode = contentLine.substring(6).trim();
        child.fail = failNode;
      } else if (
        contentLine.startsWith('+add:') ||
        contentLine.startsWith('+rem:')
      ) {
        if (!child.mod) {
          child.mod = [];
        }
        const resources = this.parseResources(contentLine);
        child.mod.push(...resources);
      } else if (contentLine.startsWith('+next:')) {
        if (child.type === 'choice') {
          throw new Error(`Cannot add next to choice child: ${child.id}`);
        }
        child.next = contentLine.substring(6).trim();
      }

      this.currentLine++;
    }

    return child;
  }

  parseChoice(choiceLine: string): GameEventChoice {
    const [next, text, conditionText] = splitDelimTrim(
      choiceLine.slice(3),
      ARG_DELIMITER
    );

    return {
      text,
      conditionText,
      next,
    };
  }

  parseDice(diceLine: string): string[] {
    const diceMatch = diceLine.match(/^\+dice:(.+)$/);
    if (!diceMatch) {
      throw new Error(`Invalid dice format: ${diceLine}`);
    }

    const dicePart = diceMatch[1].trim();
    const diceStrings = splitDelimTrim(dicePart, ARG_DELIMITER);
    const rolls: string[] = [];

    for (const diceString of diceStrings) {
      const diceMatch = diceString.match(/^(.*)$/);
      if (!diceMatch) {
        throw new Error(`Invalid dice format string: ${diceString}`);
      }
      const resourceText = diceMatch[1];
      rolls.push(resourceText);
    }

    return rolls;
  }

  parseResources(resourceLine: string): string[] {
    const isAdd = resourceLine.startsWith('+add:');
    const isRemove = resourceLine.startsWith('+rem:');

    if (!isAdd && !isRemove) {
      throw new Error(`Invalid resource line: ${resourceLine}`);
    }

    const resourcePart = resourceLine.substring(isAdd ? 5 : 6).trim();

    const resourceStrings = splitDelimTrim(resourcePart, ARG_DELIMITER);
    const resources: string[] = [];

    for (const resourceString of resourceStrings) {
      const resourceMatch = resourceString.match(/^(.*)$/);
      // console.log('MATCH RESOURCE STRING', resourceString, resourceMatch);
      if (!resourceMatch) {
        throw new Error(`Invalid resource format: ${resourceString}`);
      }

      const resourceText = resourceMatch[1];

      resources.push(isRemove ? '-' + resourceText : resourceText);
    }

    return resources;
  }
}

// Helper function to parse an event string
export function parseEvent(eventString: string): GameEvent {
  const parser = new EventParser();
  return parser.parseEventString(eventString);
}

// Helper function to parse multiple events from a string
export function parseEvents(eventsString: string): GameEvent[] {
  const parser = new EventParser();
  return parser.parseMultipleEvents(eventsString);
}
