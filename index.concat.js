let defaultEventState = {
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
let DIV = 'div';
let BUTTON = 'button';
let P = 'p';
let SPAN = 'span';
let TRANSITION = 'transition';
let TRANSFORM = 'transform';
let INNER_HTML = 'innerHTML';
let EVENT_CLICK = 'click';
let EVENT_MOUSE_OVER = 'mouseover';
let EVENT_DRAG_START = 'dragstart';
let EVENT_DRAG_END = 'dragend';
let EVENT_DRAG_OVER = 'dragover';
let EVENT_DRAG_LEAVE = 'dragleave';
let EVENT_DROP = 'drop';
let DRAGGABLE = 'draggable';
let getDocumentBody = () => {
    return document.body;
};
let getGameRoot = () => {
    return getElementById('game');
};
let setStyle = (element, styles) => {
    for (let k in styles) {
        element.style[k] = styles[k];
    }
};
let createElement = (tag, attributes = {}, children = []) => {
    let element = document.createElement(tag);
    for (let k in attributes) {
        if (k === INNER_HTML) {
            element.innerHTML = attributes[k];
        }
        else {
            element.setAttribute(k, attributes[k]);
        }
    }
    for (let child of children) {
        element.appendChild(child);
    }
    return element;
};
let appendChild = (parent, child) => {
    parent.appendChild(child);
};
let prependChild = (parent, child) => {
    parent.prepend(child);
};
let removeChild = (parent, child) => {
    parent.removeChild(child);
};
let clearChildren = (parent) => {
    parent[INNER_HTML] = '';
};
let getElementById = (id) => {
    return document.getElementById(id);
};
let getElementsByClassName = (className) => {
    return document.getElementsByClassName(className);
};
let domAddEventListener = (element, event, listener) => {
    element.addEventListener(event, listener);
};
let domRemoveEventListener = (element, event, listener) => {
    element.removeEventListener(event, listener);
};
let setAttribute = (element, attribute, value) => {
    element.setAttribute(attribute, value);
};
let removeAttribute = (element, attribute) => {
    element.removeAttribute(attribute);
};
let hasAttribute = (element, attribute) => {
    return element.hasAttribute(attribute);
};
let preventDefault = (event) => {
    event.preventDefault();
};
let nextTick = (callback) => {
    timeoutPromise(1).then(callback);
};
let timeoutPromise = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
function copyObject(obj) {
    return structuredClone(obj);
}
let ARG_DELIMITER = '|';
let CONDITION_DELIMITER = ',';
class EventParser {
    lines = [];
    currentLine = 0;
    parseMultipleEvents(eventsString) {
        let events = [];
        let lines = eventsString.trim().split('\n');
        let currentEventLines = [];
        let _parseEvent = (eventString) => {
            try {
                let event = this.parseEventString(eventString);
                events.push(event);
            }
            catch (error) {
                console.warn('Failed to parse last event:', error);
            }
        };
        for (let line of lines) {
            let trimmedLine = line.trim();
            if (trimmedLine.startsWith('#') && currentEventLines.length > 0) {
                let currentEventString = currentEventLines.join('\n');
                _parseEvent(currentEventString);
                currentEventLines = [trimmedLine];
            }
            else {
                currentEventLines.push(trimmedLine);
            }
        }
        if (currentEventLines.length > 0) {
            let lastEventString = currentEventLines.join('\n');
            _parseEvent(lastEventString);
        }
        return events;
    }
    parseEventString(eventString) {
        this.lines = splitDelimTrim(eventString.trim(), '\n').filter(line => line.length > 0);
        this.currentLine = 0;
        let headerLine = this.lines[this.currentLine];
        if (!headerLine.startsWith('#')) {
            throw new Error('Event must start with # followed by title and icon');
        }
        let headerMatch = headerLine.match(/^#(.+?),(.+)$/);
        if (!headerMatch) {
            throw new Error('Invalid header format. Expected: #Title,icon_name');
        }
        let title = headerMatch[1].trim();
        let icon = headerMatch[2].trim();
        this.currentLine++;
        let children = [];
        let event = {
            title,
            icon,
            children,
            vars: {},
        };
        while (this.currentLine < this.lines.length) {
            let child = this.parseChild(event);
            if (child) {
                children.push(child);
            }
        }
        return event;
    }
    parseChild(event) {
        if (this.currentLine >= this.lines.length) {
            return null;
        }
        let line = this.lines[this.currentLine];
        if (line.startsWith('@')) {
            let varMatch = line.match(/^(@.+)=(.+)$/);
            if (!varMatch) {
                throw new Error(`Invalid variable format: ${line}`);
            }
            let varName = varMatch[1].trim();
            let varValue = varMatch[2].trim();
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
        let childMatch = line.match(/^>([\d\w]+|[a-z]),(\w+):?$/);
        if (!childMatch) {
            throw new Error(`Invalid child format at line ${this.currentLine + 1}: ${line}`);
        }
        let id = childMatch[1];
        let type = childMatch[2];
        this.currentLine++;
        let child = { id, type };
        while (this.currentLine < this.lines.length) {
            let contentLine = this.lines[this.currentLine];
            if (contentLine.startsWith('>')) {
                break;
            }
            if (contentLine.startsWith('+p:')) {
                let text = contentLine.substring(3).trim();
                child.p = text;
            }
            else if (contentLine.startsWith('+c:')) {
                if (child.type !== 'choice') {
                    throw new Error(`Cannot add choice to non-choice child: ${child.id}`);
                }
                if (!child.choices) {
                    child.choices = [];
                }
                let text = contentLine;
                let choice = this.parseChoice(text);
                child.choices.push(choice);
            }
            else if (contentLine.startsWith('+dice:')) {
                if (!child.rolls) {
                    child.rolls = [];
                }
                let dice = this.parseDice(contentLine);
                child.rolls.push(...dice);
            }
            else if (contentLine.startsWith('+pass:')) {
                let passNode = contentLine.substring(6).trim();
                child.pass = passNode;
            }
            else if (contentLine.startsWith('+fail:')) {
                let failNode = contentLine.substring(6).trim();
                child.fail = failNode;
            }
            else if (contentLine.startsWith('+add:') ||
                contentLine.startsWith('+rem:')) {
                if (!child.mod) {
                    child.mod = [];
                }
                let resources = this.parseResources(contentLine);
                child.mod.push(...resources);
            }
            else if (contentLine.startsWith('+next:')) {
                if (child.type === 'choice') {
                    throw new Error(`Cannot add next to choice child: ${child.id}`);
                }
                child.next = contentLine.substring(6).trim();
            }
            this.currentLine++;
        }
        return child;
    }
    parseChoice(choiceLine) {
        let [next, text, conditionText] = splitDelimTrim(choiceLine.slice(3), ARG_DELIMITER);
        return {
            text,
            conditionText,
            next,
        };
    }
    parseDice(diceLine) {
        let diceMatch = diceLine.match(/^\+dice:(.+)$/);
        if (!diceMatch) {
            throw new Error(`Invalid dice format: ${diceLine}`);
        }
        let dicePart = diceMatch[1].trim();
        let diceStrings = splitDelimTrim(dicePart, ARG_DELIMITER);
        let rolls = [];
        for (let diceString of diceStrings) {
            let diceMatch = diceString.match(/^(.*)$/);
            if (!diceMatch) {
                throw new Error(`Invalid dice format string: ${diceString}`);
            }
            let resourceText = diceMatch[1];
            rolls.push(resourceText);
        }
        return rolls;
    }
    parseResources(resourceLine) {
        let isAdd = resourceLine.startsWith('+add:');
        let isRemove = resourceLine.startsWith('+rem:');
        if (!isAdd && !isRemove) {
            throw new Error(`Invalid resource line: ${resourceLine}`);
        }
        let resourcePart = resourceLine.substring(isAdd ? 5 : 6).trim();
        let resourceStrings = splitDelimTrim(resourcePart, ARG_DELIMITER);
        let resources = [];
        for (let resourceString of resourceStrings) {
            let resourceMatch = resourceString.match(/^(.*)$/);
            // console.log('MATCH RESOURCE STRING', resourceString, resourceMatch);
            if (!resourceMatch) {
                throw new Error(`Invalid resource format: ${resourceString}`);
            }
            let resourceText = resourceMatch[1];
            resources.push(isRemove ? '-' + resourceText : resourceText);
        }
        return resources;
    }
}
// Helper function to parse an event string
function parseEvent(eventString) {
    let parser = new EventParser();
    return parser.parseEventString(eventString);
}
// Helper function to parse multiple events from a string
function parseEvents(eventsString) {
    let parser = new EventParser();
    return parser.parseMultipleEvents(eventsString);
}
let runEvent = (state, event) => {
    let eventState = createEventState(event);
    evaluateVars(state, eventState, event);
    replaceVars(eventState, event);
    let modal = state.ui.eventModal;
    if (!modal) {
        modal = createEventModal(eventState);
        appendChild(getGameRoot(), modal.root);
    }
    else {
        eventModalAddTitle(modal, eventState);
    }
    state.ui.eventModal = modal;
    console.log('run event', event);
    gameEventRunChild(state, eventState, gameEventGetChild(eventState, eventState.currentChildId));
};
let gameEventRunChild = (state, eventState, child) => {
    let modal = state.ui.eventModal;
    if (!modal) {
        throw new Error('Cannot run child: No event modal found');
    }
    if (child.type === 'end') {
        if (child.id === 'nextDay') {
            gameAdvanceDay(state);
        }
        else if (child.id === 'eIntro') {
            state.day = 0;
            gameAdvanceDay(state, 'Tomorrow you start your first day as a witch.');
            return;
        }
        else {
            // run default event
            let newEventState = copyObject(defaultEventState);
            gameCreateMerchantEvents(state, newEventState);
            gameCreateBrewingEvents(state, newEventState);
            gameCreateViewInventoryEvents(state, newEventState);
            gameEventRunChild(state, newEventState, newEventState.event.children[0]);
        }
        return;
    }
    if (child.p) {
        child.p = gameEventReplaceEnumWithIcons(child.p, COLOR_HIGHLIGHT_DARK_TEXT);
    }
    if (child.choices) {
        for (let choice of child.choices) {
            choice.text = gameEventReplaceEnumWithIcons(choice.text, COLOR_HIGHLIGHT_DARK_TEXT);
            if (!choice.parsedCondition) {
                choice.parsedCondition = gameEventParseCondition(state, eventState, choice.conditionText);
            }
        }
    }
    if (child.rolls) {
        child.parsedRolls = [];
        for (let roll of child.rolls) {
            let [amt, resource] = parseAmountAndResource(roll);
            for (let i = 0; i < amt; i++) {
                child.parsedRolls.push(resource);
            }
        }
    }
    if (child.mod) {
        child.parsedMod = [];
        for (let modifyResource of child.mod) {
            let [amt, resource] = parseAmountAndResource(modifyResource);
            child.parsedMod.push({
                amt,
                resource,
            });
            gameModifyResource(state, eventState, child, resource, amt);
        }
    }
    if (child.re) {
        console.log('re generating event state');
        // generate default event
        eventState = copyObject(defaultEventState);
        gameCreateMerchantEvents(state, eventState);
        gameCreateBrewingEvents(state, eventState);
        gameCreateViewInventoryEvents(state, eventState);
    }
    eventModalAddChild(modal, child, eventState, state);
    setPrimaryResources(state.ui.res, state);
    setFavorMeterPct(state.ui.favorMeter, gameStateGetResourceCount(state, ResourceType.FAVOR_CAT));
};
let gameEventGetChild = (eventState, childId) => {
    if (childId === 'e') {
        return {
            id: 'e',
            type: 'end',
        };
    }
    let child = eventState.event.children.find(child => child.id === childId);
    if (!child) {
        throw new Error(`Cannot getChild: Child with id ${childId} not found in event ${eventState.event.title}`);
    }
    return child;
};
let createEventState = (event) => {
    return {
        event,
        currentChildId: event.children[0].id,
        evalVars: {},
    };
};
let gameEventParseResourceFunc2 = (text, func, args, state) => {
    // console.log('parse resource func', text, func, args);
    let _parseAmt = (amtText) => {
        if (amtText.includes('RAND')) {
            let spl = amtText.slice(4).split('_');
            let amtLower = parseInt(spl[0]);
            let amtUpper = parseInt(spl[1]);
            if (isNaN(amtLower) || isNaN(amtUpper)) {
                throw new Error(`Invalid RAND amount: ${amtText}`);
            }
            return randInRange(amtLower, amtUpper);
        }
        let amt = parseInt(amtText);
        if (isNaN(amt)) {
            throw new Error(`Invalid ARG amount: ${amtText}`);
        }
        return amt;
    };
    let _parseArgsForAmtFunc = (resList) => {
        let amt = _parseAmt(args[0]);
        let requireExist = args[1] === 'y';
        let resToReturn = [];
        while (resToReturn.length === 0 && amt > 0) {
            resToReturn = requireExist
                ? resList.filter(herb => gameStateHasResource(state, herb, amt))
                : resList;
            amt--;
        }
        if (resToReturn.length === 0) {
            console.log('No resources found for', func, args);
            return [0, ResourceType.GOLD];
        }
        return [amt + 1, randInArray(resToReturn)];
    };
    let funcResults = {
        [ResourceTypeFunc.FUNC_RANDOM_HERB_TIER_1]: () => {
            return _parseArgsForAmtFunc(HERB_TIER_1_NAMES);
        },
        [ResourceTypeFunc.FUNC_RANDOM_HERB_TIER_2]: () => {
            return _parseArgsForAmtFunc(HERB_TIER_2_NAMES);
        },
        [ResourceTypeFunc.FUNC_RANDOM_HERB_ANY]: () => {
            return _parseArgsForAmtFunc(HERB_NAMES);
        },
        [ResourceTypeFunc.FUNC_RANDOM_REAGENT_TIER_1]: () => {
            return _parseArgsForAmtFunc(REAGENT_TIER_1_NAMES);
        },
        [ResourceTypeFunc.FUNC_RANDOM_REAGENT_TIER_2]: () => {
            return _parseArgsForAmtFunc(REAGENT_TIER_2_NAMES);
        },
        [ResourceTypeFunc.FUNC_RANDOM_REAGENT_ANY]: () => {
            return _parseArgsForAmtFunc(REAGENT_NAMES);
        },
        [ResourceTypeFunc.FUNC_RANDOM_POTION_TIER_1]: () => {
            return _parseArgsForAmtFunc(POTION_NAMES.filter(p => p !== ResourceType.POT_LIQUID_LUCK));
        },
        [ResourceTypeFunc.FUNC_RANDOM_POTION_ANY]: () => {
            return _parseArgsForAmtFunc(POTION_NAMES);
        },
        [ResourceTypeFunc.FUNC_RANDOM_GOLD]: () => {
            return _parseArgsForAmtFunc([ResourceType.GOLD]);
        },
        [ResourceTypeFunc.FUNC_RANDOM_FIRE_MAGIC]: () => {
            return _parseArgsForAmtFunc([ResourceType.DICE_FIRE_MAGIC]);
        },
        [ResourceTypeFunc.FUNC_RANDOM_HEART_MAGIC]: () => {
            return _parseArgsForAmtFunc([ResourceType.DICE_HEART_MAGIC]);
        },
        [ResourceTypeFunc.FUNC_RANDOM_GROW]: () => {
            return _parseArgsForAmtFunc([ResourceType.DICE_GROW]);
        },
    };
    let funcResult = funcResults[func];
    if (funcResult) {
        return funcResult();
    }
    throw new Error(`Unknown resource function: "${func}" after parsing "${text}"`);
};
let gameEventReplaceEnumWithIcons = (text, highlightColor) => {
    let result = text;
    // checking "has this function modified this text already?"
    if (text.includes('<span')) {
        return text;
    }
    // ResourceType -> enumName
    let obj = {};
    for (let [enumName, enumValue] of Object.entries(ResourceType)) {
        obj[enumValue] = enumName;
    }
    for (let [enumValue, enumName] of Object.entries(obj)) {
        let labelObj = Labels[enumValue];
        if (!labelObj) {
            throw new Error(`Unknown enum value: ${enumValue}`);
        }
        let label = highlightText(labelObj.l, highlightColor);
        // if (DICE_NAMES.includes(enumValue as ResourceType)) {
        //   label = '';
        // }
        let replacement = `${label}${Labels[enumValue].icon}`;
        result = result.replaceAll(enumName, replacement);
    }
    return result;
};
let gameEventParseCondition = (state, gameEventState, conditionString) => {
    if (!conditionString) {
        return () => true;
    }
    let arr = splitDelimTrim(conditionString, CONDITION_DELIMITER);
    let resFuncs = [];
    for (let cond of arr) {
        let _parseHasResource = (str) => {
            let arr = parseFunc(str, ConditionFunc.HAS_RESOURCE);
            if (!arr) {
                return;
            }
            let [amt, resource] = parseAmountAndResource(arr[1].join(' '));
            return () => {
                return gameStateHasResource(state, resource, amt);
            };
        };
        let hasResource = _parseHasResource(cond);
        if (hasResource) {
            resFuncs.push(hasResource);
        }
    }
    if (resFuncs.length === 0) {
        throw new Error(`Unknown condition format: ${conditionString}`);
    }
    return () => {
        return resFuncs.every(func => func());
    };
};
let replaceVarsInText = (text, evalVars) => {
    for (let [varName, varValue] of Object.entries(evalVars)) {
        text = text.replaceAll(varName, varValue);
    }
    return text;
};
let parseAmountAndResource = (text) => {
    let arr = text.split(' ');
    if (arr.length === 2) {
        // if (arr[1] === 'ANY') {
        //   return [1, 'ANY'];
        // }
        return [parseInt(arr[0]), stringToResourceType(arr[1])];
    }
    return [1, ResourceType.GOLD];
};
let parseFunc = (text, expectedFunc) => {
    let match = text.match(new RegExp(`(${expectedFunc ?? '.*'})\\(([^)]*)\\)`));
    if (match) {
        let func = match[1];
        if (func[0] === '-') {
            func = func.slice(1);
        }
        let args = splitDelimTrim(match[2], ' ');
        return [func, args, match[0]];
    }
};
let evaluateVars = (state, eventState, event) => {
    for (let varName in event.vars) {
        let obj = event.vars[varName];
        let parsedFunc = parseFunc(obj.str);
        if (parsedFunc) {
            let existingParsed = eventState.evalVars[varName];
            if (existingParsed) {
                obj.parsed = existingParsed;
                continue;
            }
            let [func, args, fullMatch] = parsedFunc;
            let [amt, resourceName] = gameEventParseResourceFunc2(fullMatch, func, args, state);
            let str = amt + ' ' + resourceName;
            obj.parsed = str;
            eventState.evalVars[varName] = str;
        }
        else {
            obj.parsed = obj.str;
            eventState.evalVars[varName] = obj.str;
        }
    }
};
let replaceVars = (eventState, event) => {
    for (let child of event.children) {
        if (child.p) {
            child.p = replaceVarsInText(child.p, eventState.evalVars);
        }
        if (child.choices) {
            for (let choice of child.choices) {
                choice.text = replaceVarsInText(choice.text, eventState.evalVars);
                if (choice.conditionText) {
                    choice.conditionText = replaceVarsInText(choice.conditionText, eventState.evalVars);
                }
            }
        }
        if (child.rolls) {
            for (let i = 0; i < child.rolls.length; i++) {
                let roll = child.rolls[i];
                child.rolls[i] = replaceVarsInText(roll, eventState.evalVars);
            }
        }
        if (child.mod) {
            for (let i = 0; i < child.mod.length; i++) {
                let mod = child.mod[i];
                child.mod[i] = replaceVarsInText(mod, eventState.evalVars);
            }
        }
    }
};
var ResourceType;
(function (ResourceType) {
    ResourceType["GOLD"] = "GOLD";
    ResourceType["HERB_SPARKLEWEED"] = "HERB_SPARKLEWEED";
    ResourceType["HERB_BRAMBLEBERRY"] = "HERB_BRAMBLEBERRY";
    ResourceType["HERB_SPECIALPETAL"] = "HERB_SPECIALPETAL";
    ResourceType["REAG_SKY_DUST"] = "REAG_SKY_DUST";
    ResourceType["REAG_SUN_POWDER"] = "REAG_SUN_POWDER";
    ResourceType["POT_COLD_CURE"] = "POT_COLD_CURE";
    ResourceType["POT_DRAGON_SWEAT"] = "POT_DRAGON_SWEAT";
    ResourceType["POT_MIASMA_OF_MIDNIGHT"] = "POT_MIASMA_OF_MIDNIGHT";
    ResourceType["POT_TINCTURE_OF_TASTE"] = "POT_TINCTURE_OF_TASTE";
    // POT_REDO = 'POT_REDO',
    ResourceType["POT_EMPATHY"] = "POT_EMPATHY";
    ResourceType["POT_GROWTH"] = "POT_GROWTH";
    ResourceType["POT_LIQUID_LUCK"] = "POT_LIQUID_LUCK";
    ResourceType["POT_POWER_POTION"] = "POT_POWER_POTION";
    ResourceType["DICE_FIRE_MAGIC"] = "DICE_FIRE_MAGIC";
    ResourceType["DICE_HEART_MAGIC"] = "DICE_HEART_MAGIC";
    ResourceType["DICE_GROW"] = "DICE_GROW";
    ResourceType["DICE_ANY"] = "ANY";
    ResourceType["DICE_NEW"] = "DICE_NEW";
    ResourceType["BLUEPRINT_SPARKLEWEED"] = "BLUEPRINT_SPARKLEWEED";
    ResourceType["BLUEPRINT_BRAMBLEBERRY"] = "BLUEPRINT_BRAMBLEBERRY";
    ResourceType["BLUEPRINT_SPECIALPETAL"] = "BLUEPRINT_SPECIALPETAL";
    ResourceType["CONTRACT_VILLAGER"] = "CONTRACT_VILLAGER";
    ResourceType["CONTRACT_CAT"] = "CONTRACT_CAT";
    ResourceType["FAVOR_CAT"] = "FAVOR_CAT";
    ResourceType["EFFECT_COLD"] = "EFFECT_COLD";
    ResourceType["EFFECT_GREEN_THUMB"] = "EFFECT_GREEN_THUMB";
})(ResourceType || (ResourceType = {}));
let DICE_NAMES = [
    ResourceType.DICE_FIRE_MAGIC,
    ResourceType.DICE_HEART_MAGIC,
    ResourceType.DICE_GROW,
];
let HERB_NAMES = [
    ResourceType.HERB_SPARKLEWEED,
    ResourceType.HERB_BRAMBLEBERRY,
    ResourceType.HERB_SPECIALPETAL,
];
let HERB_TIER_1_NAMES = [
    ResourceType.HERB_SPARKLEWEED,
    ResourceType.HERB_BRAMBLEBERRY,
];
let HERB_TIER_2_NAMES = [ResourceType.HERB_SPECIALPETAL];
let REAGENT_NAMES = [
    ResourceType.REAG_SKY_DUST,
    ResourceType.REAG_SUN_POWDER,
];
let REAGENT_TIER_1_NAMES = [ResourceType.REAG_SKY_DUST];
let REAGENT_TIER_2_NAMES = [ResourceType.REAG_SUN_POWDER];
let POTION_NAMES = [
    ResourceType.POT_COLD_CURE,
    ResourceType.POT_DRAGON_SWEAT,
    ResourceType.POT_MIASMA_OF_MIDNIGHT,
    ResourceType.POT_TINCTURE_OF_TASTE,
    ResourceType.POT_GROWTH,
    ResourceType.POT_POWER_POTION,
    ResourceType.POT_LIQUID_LUCK,
];
let BLUEPRINT_NAMES = [
    ResourceType.BLUEPRINT_SPARKLEWEED,
    ResourceType.BLUEPRINT_BRAMBLEBERRY,
    ResourceType.BLUEPRINT_SPECIALPETAL,
];
let BUY_COSTS = {
    [ResourceType.REAG_SKY_DUST]: 2,
    [ResourceType.REAG_SUN_POWDER]: 3,
};
let SELL_COSTS = {
    // [ResourceType.REAG_SKY_DUST]: 1,
    // [ResourceType.REAG_SUN_POWDER]: 1,
    // [ResourceType.HERB_SPARKLEWEED]: 1,
    // [ResourceType.HERB_BRAMBLEBERRY]: 2,
    // [ResourceType.HERB_SPECIALPETAL]: 2,
    [ResourceType.POT_COLD_CURE]: 2,
    [ResourceType.POT_DRAGON_SWEAT]: 2,
    [ResourceType.POT_MIASMA_OF_MIDNIGHT]: 5,
    [ResourceType.POT_TINCTURE_OF_TASTE]: 5,
    [ResourceType.POT_LIQUID_LUCK]: 10,
    [ResourceType.POT_POWER_POTION]: 10,
    [ResourceType.POT_GROWTH]: 10,
};
let RECIPES = {
    [ResourceType.POT_COLD_CURE]: [
        ResourceType.HERB_BRAMBLEBERRY,
        ResourceType.REAG_SKY_DUST,
    ],
    [ResourceType.POT_DRAGON_SWEAT]: [
        ResourceType.HERB_SPARKLEWEED,
        ResourceType.REAG_SKY_DUST,
    ],
    [ResourceType.POT_MIASMA_OF_MIDNIGHT]: [
        ResourceType.HERB_SPARKLEWEED,
        ResourceType.HERB_SPARKLEWEED,
        ResourceType.REAG_SKY_DUST,
    ],
    [ResourceType.POT_TINCTURE_OF_TASTE]: [
        ResourceType.HERB_BRAMBLEBERRY,
        ResourceType.HERB_BRAMBLEBERRY,
        ResourceType.REAG_SKY_DUST,
    ],
    [ResourceType.POT_GROWTH]: [
        ResourceType.REAG_SKY_DUST,
        ResourceType.REAG_SUN_POWDER,
    ],
    [ResourceType.POT_EMPATHY]: [
        ResourceType.HERB_BRAMBLEBERRY,
        ResourceType.HERB_BRAMBLEBERRY,
        ResourceType.HERB_SPARKLEWEED,
        ResourceType.HERB_SPARKLEWEED,
        ResourceType.REAG_SUN_POWDER,
    ],
    [ResourceType.POT_POWER_POTION]: [
        ResourceType.HERB_SPECIALPETAL,
        ResourceType.REAG_SUN_POWDER,
    ],
    [ResourceType.POT_LIQUID_LUCK]: [
        ResourceType.HERB_BRAMBLEBERRY,
        ResourceType.HERB_SPARKLEWEED,
        ResourceType.HERB_SPECIALPETAL,
        ResourceType.REAG_SUN_POWDER,
    ],
};
var ResourceTypeFunc;
(function (ResourceTypeFunc) {
    ResourceTypeFunc["FUNC_RANDOM_HERB_TIER_1"] = "HERB1";
    ResourceTypeFunc["FUNC_RANDOM_HERB_TIER_2"] = "HERB2";
    ResourceTypeFunc["FUNC_RANDOM_HERB_TIER_3"] = "HERB3";
    ResourceTypeFunc["FUNC_RANDOM_HERB_ANY"] = "HERB";
    ResourceTypeFunc["FUNC_RANDOM_REAGENT_TIER_1"] = "REAG1";
    ResourceTypeFunc["FUNC_RANDOM_REAGENT_TIER_2"] = "REAG2";
    ResourceTypeFunc["FUNC_RANDOM_REAGENT_ANY"] = "REAG";
    ResourceTypeFunc["FUNC_RANDOM_POTION_TIER_1"] = "POT1";
    ResourceTypeFunc["FUNC_RANDOM_POTION_ANY"] = "POT";
    ResourceTypeFunc["FUNC_RANDOM_GOLD"] = "GOLD";
    ResourceTypeFunc["FUNC_RANDOM_FIRE_MAGIC"] = "FIRE";
    ResourceTypeFunc["FUNC_RANDOM_HEART_MAGIC"] = "HEART";
    ResourceTypeFunc["FUNC_RANDOM_GROW"] = "GROW";
})(ResourceTypeFunc || (ResourceTypeFunc = {}));
var ConditionFunc;
(function (ConditionFunc) {
    ConditionFunc["HAS_RESOURCE"] = "HAS";
})(ConditionFunc || (ConditionFunc = {}));
let ICON_GOLD = '💰';
let ICON_HERB = '🌿';
let ICON_REAGENT = '🧪';
let ICON_POTION = '🧴';
let ICON_FIRE_MAGIC = '🔥';
let ICON_HEART_MAGIC = '♥️';
let ICON_LUCK = '🍀';
let ICON_CAT = '<span style="filter: grayscale(100%)">🐈‍⬛</span>';
let ICON_GROW = '🌱';
let ICON_CONTRACT = '📃';
let ICON_EXCLAMATION = '❗';
let ICON_KING = '👑';
let ICON_VILLAGER = '👨';
let ICON_DRAGON = '🐲';
let ICON_FELLA = '👾';
let ICON_FAIRY = '🧚🏿‍♀️';
let ICON_WITCH = '🧙🏿‍♀️';
let ICON_WEATHER = '🌤';
let ICON_DICE = '🎲';
let ICON_COLD = '🤧';
let Labels = {
    [ResourceType.DICE_FIRE_MAGIC]: {
        l: 'Fire Magic',
        icon: ICON_FIRE_MAGIC,
        dsc: 'Used to fend off your enemies.',
    },
    [ResourceType.DICE_HEART_MAGIC]: {
        l: 'Heart Magic',
        icon: ICON_HEART_MAGIC,
        dsc: 'Can guide situations and people.',
    },
    [ResourceType.DICE_GROW]: {
        l: 'Grow',
        icon: ICON_GROW,
        dsc: 'Used to grow your magical garden.',
    },
    [ResourceType.DICE_ANY]: {
        l: 'Any',
        icon: ICON_DICE,
        dsc: 'Any magic dice.',
    },
    [ResourceType.GOLD]: {
        l: 'Gold',
        icon: ICON_GOLD,
        dsc: 'Merchants love it.',
    },
    [ResourceType.HERB_SPARKLEWEED]: {
        l: 'Sparkleweed',
        icon: ICON_HERB,
        dsc: 'A glittery weed.',
    },
    [ResourceType.HERB_BRAMBLEBERRY]: {
        l: 'Brambleberry',
        icon: ICON_HERB,
        dsc: 'Magical berries that make potion bases.',
    },
    [ResourceType.HERB_SPECIALPETAL]: {
        l: 'Specialpetal',
        icon: ICON_HERB,
        dsc: 'Rare flower for rare potions.',
    },
    [ResourceType.REAG_SKY_DUST]: {
        l: 'Sky Dust',
        icon: ICON_REAGENT,
        dsc: 'Common dust collected on magical clouds.',
    },
    [ResourceType.REAG_SUN_POWDER]: {
        l: 'Sun Powder',
        icon: ICON_REAGENT,
        dsc: 'Rare ground-up sunbeams.',
    },
    [ResourceType.POT_COLD_CURE]: {
        l: 'Cold Cure',
        icon: ICON_POTION,
        dsc: 'Instantly cures the common cold.',
    },
    [ResourceType.POT_DRAGON_SWEAT]: {
        l: 'Dragon Sweat',
        icon: ICON_POTION,
        dsc: 'Immunity to fire.',
    },
    [ResourceType.POT_MIASMA_OF_MIDNIGHT]: {
        l: 'Miasma of Midnight',
        icon: ICON_POTION,
        dsc: 'Sleep until midnight exactly.',
    },
    [ResourceType.POT_TINCTURE_OF_TASTE]: {
        l: 'Tincture of Taste',
        icon: ICON_POTION,
        dsc: 'Makes any food taste better.',
    },
    [ResourceType.POT_EMPATHY]: {
        l: 'Empathy Potion',
        icon: ICON_POTION,
        dsc: 'Grants supernatural empathy.',
    },
    [ResourceType.POT_LIQUID_LUCK]: {
        l: 'Liquid Luck',
        icon: ICON_POTION,
        dsc: 'Grants luck.',
    },
    [ResourceType.POT_POWER_POTION]: {
        l: 'Power Potion',
        icon: ICON_POTION,
        dsc: 'The power within you is amplified.',
    },
    // [ResourceType.POT_REDO]: {
    //   l: 'Retry Serum',
    //   icon: ICON_POTION,
    //   dsc: 'Failed dice roll again.',
    // },
    [ResourceType.POT_GROWTH]: {
        l: 'Growth Potion',
        icon: ICON_POTION,
        dsc: 'Increases growth.',
    },
    [ResourceType.CONTRACT_VILLAGER]: {
        l: 'Contract',
        icon: ICON_CONTRACT,
        dsc: 'A simple request.',
    },
    [ResourceType.CONTRACT_CAT]: {
        l: 'Cat',
        icon: ICON_CONTRACT,
        dsc: 'A complex request.',
    },
    [ResourceType.FAVOR_CAT]: {
        l: "Cat's Favor",
        icon: ICON_CAT,
        dsc: 'Your standing with the Black Cat.',
    },
    [ResourceType.BLUEPRINT_SPARKLEWEED]: {
        l: 'Seed of Sparkleweed',
        icon: ICON_GROW,
        dsc: 'Allows you 1 additional Sparkleweed seed bed.',
    },
    [ResourceType.BLUEPRINT_BRAMBLEBERRY]: {
        l: 'Seed of Brambleberry',
        icon: ICON_GROW,
        dsc: 'Allows you 1 additional Brambleberry seed bed.',
    },
    [ResourceType.BLUEPRINT_SPECIALPETAL]: {
        l: 'Seed of Specialpetal',
        icon: ICON_GROW,
        dsc: 'Allows you 1 additional Specialpetal seed bed.',
    },
    [ResourceType.DICE_NEW]: {
        l: 'Magic Dice',
        icon: ICON_DICE,
        dsc: 'A new magic dice.',
    },
    [ResourceType.EFFECT_COLD]: {
        l: 'Cold',
        icon: ICON_COLD,
        dsc: 'You have a cold.',
    },
    [ResourceType.EFFECT_GREEN_THUMB]: {
        l: 'Green Thumbs',
        icon: ICON_GROW,
        dsc: 'Your thumbs are bright green.',
    },
};
for (let key in Labels) {
    Labels[key].icon = `<${SPAN} class="icon">${Labels[key].icon}</${SPAN}>`;
}
let getResourceFromLabel = (label) => {
    let ind = label.lastIndexOf('>');
    if (ind > -1) {
        label = label.slice(ind + 1);
    }
    for (let key in Labels) {
        if (Labels[key].l.toLowerCase() === label.toLowerCase()) {
            return key;
        }
    }
};
let MONSTER_NAMES = [
    'Giant Frog',
    'Giant Spider',
    'Medusa',
    'Cyclops',
    'Ogre',
    'Troll',
    'Phoenix',
    'Hydra',
    'Minotaur',
    'Griffon',
    'Golem',
    'Wraith',
    'Demon',
    // 'Dragon',
    'Lich',
    'Giant',
    'Wyrm',
];
let EXPULSION_EVENT;
let gameAdvanceDay = (state, msg) => {
    eventModalAddChild(state.ui.eventModal, {
        id: '1',
        type: 'modify',
        p: msg ?? 'You close up your shop for the day.',
    }, {
        event: state.events[state.day],
        evalVars: {},
        currentChildId: '1',
    }, state);
    let moonAnim = createElement(P, {
        class: 'moon-anim',
    });
    appendChild(state.ui.eventModal.content, moonAnim);
    for (let i = 0; i < 2; i++) {
        appendChild(state.ui.eventModal.content, createElement('br'));
    }
    let phases = [...'🌕🌕🌕🌕🌖🌗🌘🌑🌒🌓🌔🌕🌕🌕🌕'];
    for (let i = 0; i < phases.length; i++) {
        timeoutPromise(i * 100).then(() => {
            moonAnim[INNER_HTML] = phases[i];
            eventModalScrollToBottom(state.ui.eventModal);
        });
    }
    state.day++;
    timeoutPromise(phases.length * 100).then(() => {
        moonAnim.remove();
        let sep = createElement(P, {
            [INNER_HTML]: '---<br>Day ' + state.day,
        });
        appendChild(state.ui.eventModal.content, sep);
        eventModalScrollToBottom(state.ui.eventModal);
        if (!msg) {
            calendarAdvanceDayForward(state.ui.calendar);
        }
        console.log('ADVANCE DAY', state.day, state.events[state.day]);
        let favorAmt = gameStateGetResourceCount(state, ResourceType.FAVOR_CAT);
        if (favorAmt === 0) {
            runEvent(state, EXPULSION_EVENT);
        }
        else {
            runEvent(state, state.events[state.day]);
        }
    });
};
let gameHarvest = (state, slots, multiplier = 1) => {
    console.log('HARVEST', state, slots, multiplier);
    let resourcesAdded = [];
    for (let slot of slots) {
        let numHarvestResults = slot.diceResults.filter(r => r === ResourceType.DICE_GROW).length;
        resourcesAdded.push(numHarvestResults);
        for (let i = 0; i < numHarvestResults * multiplier; i++) {
            state.res.push(slot.resourceType);
        }
    }
    setPrimaryResources(state.ui.res, state);
    return resourcesAdded;
};
let gameGetDiceResult = (dice) => {
    return randInArray(dice);
};
let gameGetDiceResults = (diceList) => {
    let results = [];
    for (let dice of diceList) {
        results.push(gameGetDiceResult(dice));
    }
    return results;
};
let gameRollDiceUi = async (arr, reqs, luck = false) => {
    let results = [];
    let promises = [];
    for (let d of arr) {
        let resultValue = luck ? reqs[0] : gameGetDiceResult(d.dice);
        promises.push(diceSpin(d.elem, resultValue, 600, 2).then(() => {
            let icon = Labels[resultValue].icon;
            diceSetFace(d.elem, icon);
            setStyle(d.elem.root, {
                borderColor: reqs.includes(resultValue) ? 'green' : 'red',
                background: reqs.includes(resultValue) ? 'green' : 'unset',
            });
        }));
        await timeoutPromise(250);
        results.push(resultValue);
    }
    await Promise.all(promises);
    return results;
};
let gameSetupEvents = (state, events) => {
    let findEventByTitle = (title) => {
        return events.find(e => e.title === title);
    };
    let shuffleEvents = (events) => {
        return events.sort(() => Math.random() - 0.5);
    };
    let START_EVENT = findEventByTitle('The Game');
    let VILLAGER_CONTRACT_EVENT = findEventByTitle('Villager Contract');
    let BLACK_CAT_EVENT = findEventByTitle('The Black Cat');
    let ATTACK_EVENT = findEventByTitle('Attack!');
    let HERB_MERCHANT_EVENT = findEventByTitle('Herb Merchant');
    let END_EVENT = findEventByTitle('The End');
    EXPULSION_EVENT = findEventByTitle('Expulsion');
    let templateEvents = [
        START_EVENT,
        VILLAGER_CONTRACT_EVENT,
        BLACK_CAT_EVENT,
        ATTACK_EVENT,
        HERB_MERCHANT_EVENT,
        END_EVENT,
        EXPULSION_EVENT,
    ];
    let eventsToShuffle = events.filter(e => !templateEvents.includes(e));
    for (let i = 0; i < 7; i++) {
        let monsterName = randInArray(MONSTER_NAMES);
        let attackEvent = copyObject(ATTACK_EVENT);
        for (let child of attackEvent.children) {
            child.p = child.p?.replace('monster', '<b>' + monsterName + '</b>');
        }
        eventsToShuffle.splice(randInRange(0, eventsToShuffle.length - 1), 0, attackEvent);
    }
    for (let i = 0; i < 4; i++) {
        let herbMerchantEvent = copyObject(HERB_MERCHANT_EVENT);
        eventsToShuffle.splice(randInRange(0, eventsToShuffle.length - 1), 0, herbMerchantEvent);
    }
    let orderedEvents = shuffleEvents(eventsToShuffle);
    for (let i = 0; i < 4; i++) {
        let contractEvent = copyObject(VILLAGER_CONTRACT_EVENT);
        orderedEvents.splice(i * 7 + randInRange(0, 6), 0, contractEvent);
    }
    for (let i = 0; i < 4; i++) {
        let blackCatEvent = copyObject(BLACK_CAT_EVENT);
        orderedEvents.splice(i * 7 + 6, 0, blackCatEvent); // every Saturday
    }
    let startEventCopy = copyObject(START_EVENT);
    let continueChild = startEventCopy.children.slice(-2)[0];
    continueChild.mod = [
        '3 GOLD',
        '1 HERB_SPARKLEWEED',
        '1 HERB_BRAMBLEBERRY',
        '1 REAG_SKY_DUST',
        '1 REAG_SUN_POWDER',
    ];
    let randomPotion = randInArray(POTION_NAMES);
    continueChild.mod.push('1 ' + randomPotion);
    let finalEvents = [startEventCopy, ...orderedEvents, END_EVENT];
    console.log('SETUP EVENTS', startEventCopy, finalEvents);
    state.events = finalEvents;
};
let gameModifyResource = (state, gameEventState, child, resource, amt) => {
    let replaceDiceFace = (face1, face2) => {
        for (let dice of state.magicDice) {
            for (let i = 0; i < dice.length; i++) {
                if (dice[i] === face1) {
                    dice[i] = face2;
                }
            }
        }
    };
    console.log(' modifying', resource, amt);
    if (resource === ResourceType.CONTRACT_VILLAGER) {
        let contractReturnEvent = createContractReturnEvent(gameEventState.event);
        let eventInd = state.events.indexOf(gameEventState.event);
        state.events.splice(eventInd + 7, 0, contractReturnEvent.event);
    }
    else if (resource === ResourceType.DICE_NEW) {
        state.magicDice.push(createMagicDice());
    }
    else if (resource === ResourceType.DICE_FIRE_MAGIC) {
        // replaceDiceFace(ResourceType.DICE_FIRE_MAGIC, ResourceType.DICE_HEART_MAGIC);
    }
    else if (resource === ResourceType.DICE_HEART_MAGIC) {
        replaceDiceFace(ResourceType.DICE_FIRE_MAGIC, ResourceType.DICE_HEART_MAGIC);
    }
    else if (resource === ResourceType.DICE_GROW) {
        replaceDiceFace(ResourceType.DICE_FIRE_MAGIC, ResourceType.DICE_GROW);
    }
    else if (resource === ResourceType.EFFECT_COLD) {
        // child.next = 'nextDay';
        timeoutPromise(1).then(() => {
            gameAdvanceDay(state, 'You take a day to rest and recover.');
        });
    }
    else {
        gameStateModifyResource(state, resource, amt);
        if (BLUEPRINT_NAMES.includes(resource)) {
            state.vars.avblBlueprints = state.vars.avblBlueprints.filter(blueprint => blueprint !== resource);
        }
    }
};
let gameCreateMerchantEvents = (state, eventState) => {
    let buyChoices = [];
    // let sellChoices: GameEventChoice[] = [];
    let buyCosts = { ...BUY_COSTS };
    // for (let res of state.vars.avblBlueprints) {
    //   buyCosts[res] = 10;
    // }
    // let sellCosts = {
    //   ...SELL_COSTS,
    // };
    for (let [res, cost] of Object.entries(buyCosts)) {
        buyChoices.push({
            text: `Buy 1 ${res} for ${cost} ${ResourceType.GOLD}`,
            next: 'buy_' + res,
            conditionText: `HAS(${cost} ${ResourceType.GOLD})`,
        });
        eventState.event.children.push({
            id: 'buy_' + res,
            type: 'modify',
            p: `You buy ${res} for ${cost} ${ResourceType.GOLD}.`,
            mod: [`-${cost} ${ResourceType.GOLD}`, `1 ${res}`],
            next: 'merch',
        });
    }
    for (let res of HERB_NAMES) {
        if (state.res.includes(res)) {
            buyChoices.push({
                text: `Sell 1 ${res} for 1 ${ResourceType.GOLD}`,
                next: 'sell_' + res,
                // conditionText: `HAS(1 ${res})`,
            });
            eventState.event.children.push({
                id: 'sell_' + res,
                type: 'modify',
                p: `You sell 1 ${res} for 1 ${ResourceType.GOLD}.`,
                mod: [`-1 ${res}`, `1 ${ResourceType.GOLD}`],
                next: 'merch',
                re: true
            });
        }
    }
    buyChoices.push({
        text: 'Go back.',
        next: 'day',
    });
    // for (let [res, cost] of Object.entries(sellCosts)) {
    //   if (state.res.includes(res as ResourceType)) {
    //     sellChoices.push({
    //       text: `Sell 1 ${res} for ${cost} ${
    //         ResourceType.GOLD
    //       }<br> (you own ${gameStateGetResourceCount(
    //         state,
    //         res as ResourceType
    //       )})`,
    //       next: 'sell_' + res,
    //     });
    //     eventState.event.children.push({
    //       id: 'sell_' + res,
    //       type: 'modify',
    //       p: `You sell ${res} for ${cost} ${ResourceType.GOLD}.`,
    //       mod: [`-1 ${res}`, `${cost} ${ResourceType.GOLD}`],
    //       next: 'merchSelling',
    //       /*@preserve*/
    //       re: true,
    //     });
    //   }
    // }
    // sellChoices.push({
    //   text: 'Go back.',
    //   next: 'day',
    // });
    eventState.event.children.push({
        /*@preserve*/
        id: 'merch',
        /*@preserve*/
        type: 'choice',
        /*@preserve*/
        p: '"What\'re you buying?"',
        /*@preserve*/
        choices: buyChoices,
    }
    // {
    //   /*@preserve*/
    //   id: 'merchSelling',
    //   /*@preserve*/
    //   type: 'choice',
    //   /*@preserve*/
    //   p: 'You rummage in your pack for wares to sell.',
    //   /*@preserve*/
    //   choices: sellChoices,
    // }
    );
};
let gameCreateBrewingEvents = (state, eventState) => {
    let choices = [];
    let herbsAndReagents = [...HERB_NAMES, ...REAGENT_NAMES];
    let recipes = { ...RECIPES };
    for (let [res, recipe] of Object.entries(recipes)) {
        let amounts = [];
        for (let potentialIngredient of herbsAndReagents) {
            let amt = recipe.filter(r => r === potentialIngredient).length;
            if (amt > 0) {
                amounts.push(`${amt} ${potentialIngredient}`);
            }
        }
        let numOwned = gameStateGetResourceCount(state, res);
        choices.push({
            text: `Brew 1 ${res} (${numOwned}) for <br>${amounts.join('<br>')}`,
            next: 'brew_' + res,
            conditionText: amounts.map(a => `HAS(${a})`).join(CONDITION_DELIMITER),
        });
        eventState.event.children.push({
            id: 'brew_' + res,
            type: 'modify',
            p: `You make a ${res}.`,
            mod: [...amounts.map(a => `-${a}`), `1 ${res}`],
            next: 'pot',
            /*@preserve*/
            re: true,
        });
    }
    choices.push({
        /*@preserve*/
        text: 'Go back.',
        /*@preserve*/
        next: 'day',
    });
    eventState.event.children.push({
        /*@preserve*/
        id: 'pot',
        /*@preserve*/
        type: 'choice',
        /*@preserve*/
        p: 'At the mixing table you can concoct magical potions.',
        /*@preserve*/
        choices,
    });
};
let gameCreateViewInventoryEvents = (state, eventState) => {
    let resAndCounts = POTION_NAMES.map(res => ({
        res,
        count: gameStateGetResourceCount(state, res),
    }));
    eventState.event.children.push({
        /*@preserve*/
        id: 'inv',
        /*@preserve*/
        type: 'modify',
        /*@preserve*/
        p: "Here's what you have:" +
            resAndCounts.map(r => ` <br>${r.res} (${r.count})`).join(''),
        /*@preserve*/
        next: 'day',
    });
};
let createContractReturnEvent = (contractEvent) => {
    let potionName = contractEvent.vars['@A'].parsed;
    let eventState = createEventState({
        title: 'The villager returns',
        icon: '📜',
        children: [
            {
                id: '0',
                type: 'choice',
                p: 'The villager from last week returns to collect their promised potion:<br>' +
                    potionName,
                choices: [
                    {
                        text: 'Give them the potion.',
                        next: '1',
                        conditionText: `HAS(${potionName})`,
                    },
                    {
                        text: 'Say you cannot help. The Black Cat will be most displeased.',
                        next: '2',
                    },
                ],
            },
            {
                id: '1',
                type: 'modify',
                p: 'You sell the potion to the villager.',
                mod: [`-${potionName}`, '3 GOLD'],
                next: 'e',
            },
            {
                id: '2',
                type: 'modify',
                p: 'The disappointed villager leaves.',
                mod: [`-2 FAVOR_CAT`],
                next: 'e',
            },
        ],
    });
    return eventState;
};
let eventString = `
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
    let gameState = createGameState();
    window.state = gameState;
    let calendar = createCalendar(30);
    appendChild(getGameRoot(), calendar.root);
    gameState.ui.calendar = calendar;
    let primaryResources = createPrimaryResources();
    gameState.ui.res = primaryResources;
    appendChild(getGameRoot(), primaryResources.root);
    setPrimaryResources(primaryResources, gameState);
    // let nextBar = createNextBar();
    // gameState.ui.nextBar = nextBar;
    // appendChild(getGameRoot(), nextBar.root);
    // nextBarSetButtonState(nextBar, gameState);
    // let garden = createGarden();
    // gameState.ui.garden = garden;
    // appendChild(getGameRoot(), garden.root);
    // setGardenSlots(garden, gameState);
    // setGardenSlots(garden, gameState);
    // updateBlueprintList(garden, gameState);
    let hoverDescription = createHoverDescription();
    appendChild(getGameRoot(), hoverDescription.root);
    hoverDescriptionDescribe(hoverDescription, ResourceType.DICE_FIRE_MAGIC);
    gameState.ui.hoverDescription = hoverDescription;
    let bottomBar = createBottomBar();
    appendChild(getGameRoot(), bottomBar.root);
    gameState.ui.favorMeter = bottomBar.favorMeter;
    let eventsTxt = `#The Game,🐈‍⬛
>0,choice
  +p: "Hello, dear witch.  I am your familiar, the Black Cat.  It is from me that you get your magic.  Ensure you keep me satisfied, lest you risk losing my favor."
  +c: 1|Continue.
  +c: 4|I already know what to do.
>1,dice
  +p: "I have provided you with a magic dice.  Hover over it to see its faces.  There are three kinds of magic."<br><br>- DICE_FIRE_MAGIC is for fending off your enemies.<br>- DICE_HEART_MAGIC is for affecting people.<br>- DICE_GROW is for growing your garden.
  +dice: 1 ANY
  +pass: 2
  +fail: 2
>2,modify
  +p: "I am tasking you with running a potion shop: each day you will harvest magical herbs, brew potions, and deal with the many problems of the nearby villagers."<br><br>- You get <b>Herbs</b> by growing them in your garden.<br>- You get <b>Reagents</b> by buying them from a merchant.
  +next: 3
>3,modify
  +p: "Run this shop for <b>1 month</b> and you will have convinced me that you are a competent witch.  Then, and only then, I shall let you keep your magic."
  +next: 4
>4,modify
  +p: "Here's some materials to get you started.  Don't disappoint me."
  +next:eIntro
>eIntro,end

#The Wizard,🧙🏼‍♀️
@A=FIRE(1)
@B=1 HERB_SPARKLEWEED
@C=5 GOLD
@D=1 FAVOR_CAT
>0,choice
  +p: An old wizard enters your shop. He challenges you to a duel, promising a great reward.<br><br>If you win: the wizard gives @C and @B. If you lose, the wizard takes @B.<br><br>You can sense the Black Cat observing you.
  +c: 1|Accept! This guy's going down.<br>@A
  +c: 2|Reject. You're not interested in duels.
>2,modify
  +p: The disappointed wizard leaves.
  +next: e
>1,dice
  +p: The wizard readies a magic spell!  You raise your hands to match him.
  +dice: @A
  +pass: 3
  +fail: 4
>3,modify
  +p: Your spells clash in magnificent glory, but when the smoke clears you stand triumphant! The defeated wizard shells out what he agreed to and leaves.<br><br>You can feel that the Black Cat appreciates your victory.
  +add: @C|@B|@D
  +next: e
>4,modify
  +p: Damn!  His spell was just too much for you to handle.  The smug wizard pockets his earnings before leaving. You feel the Black Cat is displeased.
  +rem: @B|@D
  +next: e

#Gnome Thief,👨
@A=FIRE(2)
@B=HEART(1)
@C=HERB(RAND2_4 y)
@D=HERB(1 y)
@E=1 FAVOR_CAT
@L=The gnome slips away with your herbs.
>0,choice
  +p: You wake up early this morning to find a small gnome stealing from your garden!  With a fistful of herbs, he spots you and tries to run away as fast as his little feet can carry him.
  +c: 1|Use your magic to threaten the gnome! Effective, but you'll likely damage the herbs... @A
  +c: 2|Magically entice the gnome to give back the herbs. @B
  +c: fail|Let him take @C, but at least there'll be no ruckus.
>1,dice
  +p: You raise your hand and aim at the little fellow.
  +dice: @A
  +pass: 1pass
  +fail: fail2
>1pass,modify
  +p: The gnome drops your herbs and runs off, but errant fire damages your garden.
  +rem: @D
  +next: e
>2,dice
  +p: You call out to the gnome and attempt wrap your words with your magic.
  +dice: @B
  +pass: 2pass
  +fail: fail2
>2pass,modify
  +p: The gnome timidly hands over the herbs and scampers off to bother somebody else.
  +next: e
>fail,modify
  +p: @L
  +rem: @C
  +next: e
>fail2,modify
  +p: @L<br><br>The Black Cat is displeased with your failure.
  +rem: @C
  +rem: @E
  +next: e

#Disgruntled Customer,👤
@A=HEART(RAND1_3)
@B=POT1(1)
@C=POT1(1 y)
@D=FIRE(RAND2_3)
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
  +p: Uh oh.  She throws an impressive conniption that manifests as a lot of yelling, the fake potion shattering on the floor, and the damaging of some of your wares.  After about an hour of this screaming, she finally leaves.
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
  +p: You ready a spell to intimidate her.
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

#Injured Dragon,🐲
@A=HEART(1)
@B=1 POT_DRAGON_SWEAT
@C=6 GOLD
@E=1 FAVOR_CAT
>0,choice
  +p: A villager rushes into your shop. "My pet dragon!", he says, "He's injured. Can you help?"<br>br>You walk outside to see an irritated, tiny dragon with a gash across his body.  Smoke streams from its nostrils, ready to burn anything that comes too close.<br><br>You can sense the Black Cat observing you.
  +c: 1|You could try to calm him down so you can treat his wounds, perhaps? @A
  +c: 2|You have @B; the fire won't hurt you so you can get close and heal him.|HAS(@B) 
  +c: 3|Sorry, dragons are too dangerous.
>1,dice
  +p: Carefully you step towards the little dragon, readying your magic.
  +dice: @A
  +pass: 1pass
  +fail: 1fail
>1pass,modify
  +p: Your soothing energy calms the dragon, and he lets you approach without incident. You're able to bandage its wounds.<br><br>The grateful villager rewards you for your effort.
  +add: @C
  +next: e
>1fail,modify
  +p: The angry dragon flails and breaths crazy amounts fire.  You barely manage to escape unscathed.  The villager rushes him away, shouting about how much you upset his pet.<br><br>After this debacle, you know the Black Cat is quite displeased with you.
  +rem: 2 FAVOR_CAT
  +next: e
>2,modify
  +p: The angry dragon breaths streams of fire, but the potion protects you as you heal him.  The villager is grateful. He rewards you for your effort.
  +rem: @B
  +add: @C
  +add: @E
  +next: e
>3,modify
  +p: "Some witch you are!" The villager spits at you and leaves with his dragon.  You can sense the Black Cat's displeasure.
  +rem: @E
  +next: e

#You Have a Cold,🤧
@A=1 POT_COLD_CURE
>0,choice
  +p: You feel groggy and sick this morning, and it's a struggle to get out of bed.
  +c: 1|You're not feeling well, and simply cannot be a proper witch today.
  +c: 2|Drink @A.|HAS(@A)
>1,modify
  +p: You should feel better soon, but not today.
  +add:1 EFFECT_COLD
>2,modify
  +p: You drink @A and feel better.
  +rem: @A
  +next: e

#Green Thumbs,🌱
>0,modify
  +p: You wake up this morning to find that both of your thumbs are bright green! Alarmed, you begin to lookup how to cure this ailment until you notice that your seed beds are sparkling... Could it be?  Perhaps today you'll get extra harvest.
  +add:1 EFFECT_GREEN_THUMB
  +next: e

#Mason,🧱
@A=1 BLUEPRINT_SPARKLEWEED
@B=1 BLUEPRINT_BRAMBLEBERRY
@C=1 BLUEPRINT_SHADOWPETAL
@D=5 GOLD
@L1=Before the day is done you have a lovely new addition to your garden.
@L2=Build a bed for
>0,choice
  +p: A mason visits your shop.  He offers to upgrade your garden for @D.
  +c: 1a|@L2<br>@A.|HAS(@D)
  +c: 1b|@L2<br>@B.|HAS(@D)
  +c: 1c|@L2<br>@C.|HAS(@D)
  +c: 4|No thanks.
>1a,modify
  +p: @L1
  +rem: @D
  +add: @A
  +next: e
>1b,modify
  +p: @L1
  +rem: @D
  +add: @B
  +next: e
>1c,modify
  +p: @L1
  +rem: @D
  +add: @C
  +next: e
>4,modify
  +p: He leaves.
  +next: e

#Demonic Deal,👹
@A1=FIRE(1)
@A2=HEART(1)
@B1=FIRE(2)
@B2=GROW(1)
@L=The demon snaps its fingers, and you feel something fundamental change within you.
>0,choice
  +p: You notice a pair of eyes watching you from the shadows.  When you turn to stare, a smiling demon reveals itself. "I'll have you know, I'm a creature of peace.  Would you like a deal, my dear?"
  +c: 1|Convert all @A1 to @A2.
  +c: 2|Convert all @B1 to @B2.
  +c: 3|No thanks.
>1,modify
  +p: @L
  +add: @A2
  +next: e
>2,modify
  +p: @L
  +add: @B2
  +next: e
>3,modify
  +p: It leaves, dejected.
  +next: e

#Panicked Cook,👨🏼‍🍳
@A=1 POT_TINCTURE_OF_TASTE
>0,choice
  +p: A man in a chef's hat rushes into your shop. "Oh dear, oh dear, oh dear, I'm in a terrible terrible mess! It's the Duke's birthday today, and I should be making him a lovely big birthday cake."
  +c: 1|Inform him that this is a potion shop, not a bakery.
  +c: 2|You could give him @A. That'll make anything taste good.|HAS(@A)
>1,modify
  +p:  "I've forgotten to buy the ingredients. I'll never get them in time now. He'll sack me! What will I do", He mutters to himself as he leaves.
  +next: e
>2,modify
  +p: "I am saved! Thank you!"  He leaves you a generous tip.
  +rem: @A
  +add: 3 GOLD
  +next: e

#Herb Merchant,🛒
  @A1=GOLD(RAND1_2)
  @A2=HERB1(RAND3_4)
  @B1=GOLD(RAND2_3)
  @B2=HERB2(RAND2_3)
  @L=You make the trade.
  >0,choice
    +p: A traveling merchant offers to trade with you.  "Got a surplus of plants.  I can give ya a good deal."
    +c: 1|Trade @A1 for @A2.|HAS(@A1)
    +c: 2|Trade @B1 for @B2.|HAS(@B1)
    +c: e|Decline the offer
  >1,modify
    +p: @L
    +rem: @A1
    +add: @A2
    +next: e
  >2,modify
    +p: @L
    +rem: @B1
    +add: @B2
    +next: e

#Attack!,😈
@A=FIRE(1)
@B=HEART(2)
@C=1 FAVOR_CAT
@L=The villagers are very grateful, and scrounge together a nice reward for you.
>0,choice
  +p: A monster is attacking the village! As a witch, it is your duty to help.
  +c: 1|Fend off the monster with your magic.<br>@A
  +c: 2|Maybe diplomacy will work this time.<br>@B
>1,dice
  +p: You prepare to launch a spell at the monster.
  +dice: @A
  +pass: 1pass
  +fail: 1fail
>1pass,modify
  +p: With the villagers help, you manage to fend off the monster.<br><br>@L  
  +add: 5 GOLD
  +next: e
>1fail,modify
  +p: Your spell is not enough, and after a battle that lasts for hours, the monster is finally fended off by the villagers.  Bedraggled and exhausted, you return to your shop.<br><br>The Black Cat is displeased with your performance.
  +rem: @C
  +next: e
>2,dice
  +p: With eyes closed, you reach out to the monster's chaotic mind with your magic.
  +dice: @B
  +pass: 2pass
  +fail: 1fail
>2pass,modify
  +p: Your spell sooths the monster just enough for you to get it to decide to leave peacefully.<br><br>@L
  +add: @C
  +next: e

#Villager Contract,📜
@A=POT1(1)
@B=7 GOLD
@C=1 FAVOR_CAT
>0,choice
  +p: A villager comes to your shop and requisitions a potion:<br><br>@A.
  +c: 1|Sell the potion for @B.|HAS(@A)
  +c: 2|Say you'll have the potion ready by next week.
  +c: 3|Say you cannot help. The Black Cat won't be pleased.
>1,modify
  +p: The villager buys the potion and leaves.
  +rem: @A
  +add: @B
  +next: e
>2,modify
  +p: The villager leaves, promising to return next week.
  +next: e
  +add: 1 CONTRACT_VILLAGER
>3,modify
  +p: The villager leaves, disappointed.
  +rem: @C
  +next: e

#The Black Cat,🐈‍⬛
@A=GOLD(RAND2_4)
@B=1 FAVOR_CAT
@L1=The Black Cat's eyes glow
@L2=and new seed bed appears in your garden.
>0,choice
  +p: The Black Cat suddenly appears. "Tribute. @A. I demand it."
  +c: 1|Give the gold to the Black Cat.|HAS(@A)
  +c: fail|You don't have enough gold.
>1,modify
  +p: With a mischievous grin, The Black Cat gathers the gold.  "Much appreciated, now I shall grant you a boon."
  +rem: @A
  +next: ch
>ch,choice
  +p: "What would you like?"
  +c: 2|+1 Magic Dice.
  +c: 3|+1 BLUEPRINT_SPARKLEWEED
  +c: 4|+1 BLUEPRINT_BRAMBLEBERRY
  +c: 5|+1 BLUEPRINT_SHADOWPETAL
>2,modify
  +p: @L1 and you feel a surge of power within you.
  +add: 1 DICE_NEW
  +next: e
>3,modify
  +p: @L1, @L2
  +add: 1 BLUEPRINT_SPARKLEWEED
  +next: e
>4,modify
  +p: @L1, @L2
  +add: 1 BLUEPRINT_BRAMBLEBERRY
  +next: e
>5,modify
  +p: @L1, @L2
  +add: 1 BLUEPRINT_SHADOWPETAL
  +next: e
>fail,modify
  +p: "I see," The Black Cat says, "Do not disappoint me again."
  +rem: @B
  +next: e

#Expulsion,🐈‍⬛
>0,choice
  +p: The Black Cat appears in front of you and stares you down with disappointed eyes.<br><br>"I now see that you are not worthy of witchhood.  I should never have allowed you your magic."<br><br>A tugging, a pulling, a ripping sensation engulfs you, tearing out a piece of you, eviscerating your sense of self. You're left unconscious, on the ground with nothing.<br><br>You are no longer a witch.
  +c: 1|Try again.
  +c: 2|Quit.|HAS(999 GOLD)

#The End,🐈‍⬛
>0,choice
  +p: "Alright, that's enough," says the Black Cate. "I'm pleased with you.  You may keep your magic."<br><br>Congratulations! You've completed the game.<br><br>Would you like to play again?
  +c: 1|Yes.
  +c: 2|No.|HAS(999 GOLD)`;;
    let gameEvents = parseEvents(eventsTxt);
    gameSetupEvents(gameState, gameEvents);
    // let gameEvents2 = parseEvents(eventString);
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
    // let newEventState = copyObject(defaultEventState);
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
let createGameState = () => {
    let state = {
        events: [],
        day: 0,
        res: [],
        magicDice: [
            createMagicDice(),
            // createMagicDice(),
            // createMagicDice(),
            // createMagicDice(),
        ],
        harvestRoll: [],
        ui: {},
        vars: {
            avblBlueprints: [ResourceType.BLUEPRINT_SPECIALPETAL],
        },
    };
    state.res.push(ResourceType.BLUEPRINT_SPARKLEWEED, ResourceType.BLUEPRINT_BRAMBLEBERRY
    // ResourceType.BLUEPRINT_SPECIALPETAL
    );
    return state;
};
let createMagicDice = () => {
    return [
        ResourceType.DICE_FIRE_MAGIC,
        ResourceType.DICE_FIRE_MAGIC,
        ResourceType.DICE_HEART_MAGIC,
        ResourceType.DICE_HEART_MAGIC,
        ResourceType.DICE_GROW,
        ResourceType.DICE_GROW,
    ];
};
let createMagicDiceGrow = () => {
    let arr = [];
    for (let i = 0; i < 6; i++) {
        arr.push(ResourceType.DICE_GROW);
    }
    return arr;
};
let gameStateModifyResource = (state, resource, amt) => {
    let iterations = Math.abs(amt);
    for (let i = 0; i < iterations; i++) {
        if (amt > 0) {
            state.res.push(resource);
        }
        else {
            let index = state.res.indexOf(resource);
            if (index !== -1) {
                state.res.splice(index, 1);
            }
        }
    }
};
let gameStateGetResourceCount = (state, resource) => {
    return state.res.filter(r => r === resource).length;
};
let gameStateHasResource = (state, resource, amt) => {
    return gameStateGetResourceCount(state, resource) >= amt;
};
let gameStateGetGarden = (state) => {
    return state.res.filter(r => BLUEPRINT_NAMES.includes(r));
};
let stringToResourceType = (str) => {
    for (let resource of Object.values(ResourceType)) {
        if (str === resource) {
            return resource;
        }
    }
    throw new Error(`Unknown resource type: ${str}`);
};
let gameStateHasHarvestRoll = (state) => {
    return state.harvestRoll.length > 0;
};
let blueprintToHerb = (blueprint) => {
    switch (blueprint) {
        case ResourceType.BLUEPRINT_SPARKLEWEED:
            return ResourceType.HERB_SPARKLEWEED;
        case ResourceType.BLUEPRINT_BRAMBLEBERRY:
            return ResourceType.HERB_BRAMBLEBERRY;
        case ResourceType.BLUEPRINT_SPECIALPETAL:
            return ResourceType.HERB_SPECIALPETAL;
        default:
            throw new Error(`Unknown blueprint: ${blueprint}`);
    }
};
let getCurrentState = () => {
    return window.state;
};
let createBottomBar = () => {
    let root = createElement(DIV, {
        class: 'bottom-bar flxcr',
    });
    let favorMeter = createFavorMeter();
    appendChild(root, favorMeter.root);
    setFavorMeterPct(favorMeter, 5);
    return {
        root,
        favorMeter,
    };
};
let SQUARE_SIZE = 48;
let ACTIVE_DAY_CLASS = 'calendar-square-active';
let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let createCalendar = (days) => {
    let root = createElement(DIV, {});
    setStyle(root, {
        width: `${days * SQUARE_SIZE}px`,
    });
    let subRoot = createElement(DIV, {});
    setStyle(subRoot, {
        transition: 'transform 0.3s ease-in-out',
    });
    appendChild(root, subRoot);
    for (let i = 0; i < days; i++) {
        let square = createElement(DIV, {
            class: 'calendar-square',
            [INNER_HTML]: `${i + 1}. ${daysOfWeek[i % 7]}`,
        });
        appendChild(subRoot, square);
    }
    let calendar = {
        root,
        subRoot,
        day: 0,
    };
    return calendar;
};
let calendarSetDay = (calendar, day) => {
    calendar.day = day - 1;
    calendarAdvanceDayForward(calendar);
};
let calendarAdvanceDayForward = (calendar) => {
    calendar.day++;
    calendar.subRoot.style.transform = `translateX(-${calendar.day * SQUARE_SIZE}px)`;
    let activeChild = calendar.subRoot.children[calendar.day];
    if (activeChild) {
        activeChild.classList.add(ACTIVE_DAY_CLASS);
    }
    let prevChild = calendar.subRoot.children[calendar.day - 1];
    if (prevChild) {
        prevChild.classList.remove(ACTIVE_DAY_CLASS);
    }
};
let DICE_DEFAULT_FACE = `<${SPAN} class="icon">❓</${SPAN}>`;
let createDice = (state, magicDice, face = DICE_DEFAULT_FACE) => {
    let root = createElement(DIV, {
        class: 'dice',
    });
    let onHover = () => {
        hoverDescriptionDescribeShowDice(state.ui.hoverDescription, magicDice);
    };
    domAddEventListener(root, EVENT_CLICK, onHover);
    domAddEventListener(root, EVENT_MOUSE_OVER, onHover);
    let subRoot = createElement(DIV, {
        class: 'flxcr wh',
        [INNER_HTML]: face,
    });
    appendChild(root, subRoot);
    return {
        root,
        subRoot,
    };
};
let diceSetFace = (dice, face) => {
    dice.subRoot[INNER_HTML] = face;
};
let diceSpin = (dice, resultValue, ms, rotations) => {
    return new Promise(resolve => {
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
let createEventModal = (gameEventState) => {
    let root = createElement(DIV, {
        id: 'event-modal',
        class: 'modal',
    });
    let content = createElement(DIV, {
        class: 'event-content btext',
    });
    let choices = createElement(DIV, {
        class: 'event-next',
    });
    let next = createElement(DIV, {
        class: 'event-next',
    });
    let obj = {
        root,
        content,
        choices,
        next,
        diceButtons: [],
        diceElements: [],
    };
    eventModalAddTitle(obj, gameEventState);
    // appendChild(root, obj.title);
    appendChild(content, obj.choices);
    appendChild(content, obj.next);
    appendChild(root, obj.content);
    return obj;
};
let eventModalAddTitle = (eventModal, gameEventState) => {
    let { content } = eventModal;
    let icon = gameEventState.event.icon;
    if (icon === '🐈‍⬛') {
        icon = ICON_CAT;
    }
    if (icon) {
        let titleIcon = createElement(DIV, {
            class: 'event-title-icon',
            [INNER_HTML]: icon,
        });
        appendChild(content, titleIcon);
    }
    if (gameEventState.event.title) {
        let titleText = createElement(P, {
            class: 'event-title-text',
            [INNER_HTML]: gameEventState.event.title,
        });
        appendChild(content, titleText);
    }
};
let eventModalAddMod = (content, modifyResource) => {
    let resourceText = gameEventReplaceEnumWithIcons(modifyResource.resource, COLOR_HIGHLIGHT_DARK_TEXT);
    let isPositive = modifyResource.amt > 0;
    let amtText = isPositive ? '+' + modifyResource.amt : modifyResource.amt;
    let p2 = eventModalCreateButtonChosenText(`${amtText} ${resourceText}`);
    appendChild(content, p2);
};
let eventModalAddChild = (eventModal, gameEventChild, gameEventState, state) => {
    let { content, choices, next } = eventModal;
    let { event } = gameEventState;
    clearChildren(next);
    next.remove();
    clearChildren(choices);
    choices.remove();
    let pText = createElement(P, {
        [INNER_HTML]: gameEventChild.p,
    });
    appendChild(content, pText);
    if (gameEventChild.type === 'garden') {
        let garden = createGarden(state, gameEventState);
        appendChild(content, garden.root);
    }
    if (gameEventChild.rolls) {
        let isAny = gameEventChild.parsedRolls[0] === ResourceType.DICE_ANY;
        // let isDouble = gameStateGetResourceCount(state, ResourceType.EFFECT_DOUBLE) > 0;
        let isDouble = false;
        let p2 = createElement(P, {
            [INNER_HTML]: isAny ? 'Try it out!' : 'To pass: ',
        });
        appendChild(content, p2);
        for (let parsedRoll of gameEventChild.parsedRolls) {
            let p3 = createElement(SPAN, {
                [INNER_HTML]: Labels[parsedRoll].icon,
            });
            appendChild(p2, p3);
        }
        eventModal.diceElements = [];
        let diceToRoll = copyObject(state.magicDice);
        for (let i = 0; i < state.magicDice.length; i++) {
            let dice = createDice(state, diceToRoll[i]);
            eventModal.diceElements.push(dice);
            appendChild(content, dice.root);
        }
        eventModalAddDiceButtons(eventModal, gameEventChild, gameEventState, state, {
            isAny,
            diceToRoll,
        });
        appendChild(content, next);
    }
    if (gameEventChild.parsedMod) {
        for (let modifyResource of gameEventChild.parsedMod) {
            eventModalAddMod(content, modifyResource);
        }
    }
    if (gameEventChild.next) {
        let button = createElement(BUTTON, {
            class: CLASS_BTN_TEXT,
            [INNER_HTML]: gameEventChild.next === 'e' ? 'Done' : 'Next',
        });
        domAddEventListener(button, EVENT_CLICK, () => {
            let child = gameEventGetChild(gameEventState, gameEventChild.next);
            gameEventRunChild(state, gameEventState, child);
        });
        appendChild(next, button);
        appendChild(content, next);
    }
    if (gameEventChild.choices) {
        for (let choice of gameEventChild.choices) {
            let isDisabled = !choice?.parsedCondition();
            let args = {
                class: CLASS_BTN_TEXT,
                [INNER_HTML]: choice.text,
            };
            if (isDisabled) {
                args.disabled = 'disabled';
            }
            let button = createElement(BUTTON, args);
            domAddEventListener(button, EVENT_CLICK, () => {
                let p2 = eventModalCreateButtonChosenText(choice.text);
                appendChild(content, p2);
                let child = gameEventGetChild(gameEventState, choice.next);
                gameEventRunChild(state, gameEventState, child);
            });
            appendChild(choices, button);
        }
        appendChild(content, choices);
    }
    eventModalScrollToBottom(eventModal);
};
let eventModalScrollToBottom = (eventModal) => {
    eventModal.content.scrollTo({
        top: eventModal.content.scrollHeight,
        behavior: 'smooth',
    });
};
let eventModalHandleRollClick = async (eventModal, gameEventState, state, gameEventChild, args) => {
    let { content, diceButtons, diceElements } = eventModal;
    for (let i = 0; i < diceButtons.length; i++) {
        let button = diceButtons[i];
        if (i === 0) {
            setStyle(button, {
                visibility: 'hidden',
            });
        }
        else {
            button.remove();
        }
    }
    let diceToRoll = args.diceToRoll.slice();
    let diceResults = await gameRollDiceUi(diceToRoll.map((d, i) => ({
        dice: d,
        elem: diceElements[i],
    })), gameEventChild.parsedRolls, args.useLuck);
    let didPass = true;
    for (let roll of gameEventChild.parsedRolls) {
        let ind = diceResults.indexOf(roll);
        if (ind === -1) {
            didPass = false;
            break;
        }
        diceResults.splice(ind, 1);
    }
    timeoutPromise(1000).then(() => {
        let p = createElement(P, {
            [INNER_HTML]: args.isAny ? '' : didPass ? 'Pass!' : 'Fail!',
        });
        appendChild(content, p);
        if (args.useLuck) {
            gameStateModifyResource(state, ResourceType.POT_LIQUID_LUCK, -1);
            eventModalAddMod(content, {
                amt: -1,
                resource: ResourceType.POT_LIQUID_LUCK,
            });
        }
        if (args.usePower) {
            eventModalAddMod(content, {
                amt: -1,
                resource: ResourceType.POT_POWER_POTION,
            });
        }
        if (args.useEmpathy) {
            eventModalAddMod(content, {
                amt: -1,
                resource: ResourceType.POT_EMPATHY,
            });
        }
        let child = gameEventGetChild(gameEventState, didPass ? gameEventChild.pass : gameEventChild.fail);
        gameEventRunChild(state, gameEventState, child);
    });
};
let eventModalAddDiceButtons = (eventModal, gameEventChild, gameEventState, state, args) => {
    let eventFuncArgs = {
        isAny: args.isAny,
        useLuck: false,
        useDouble: false,
        usePower: false,
        useEmpathy: false,
        diceToRoll: args.diceToRoll,
    };
    eventModal.diceButtons = [];
    let { next, content } = eventModal;
    let button = createElement(BUTTON, {
        class: CLASS_BTN_TEXT,
        [INNER_HTML]: 'Roll.',
    });
    domAddEventListener(button, EVENT_CLICK, () => {
        eventModalHandleRollClick(eventModal, gameEventState, state, gameEventChild, eventFuncArgs);
    });
    appendChild(next, button);
    eventModal.diceButtons.push(button);
    let luckPotionCount = gameStateGetResourceCount(state, ResourceType.POT_LIQUID_LUCK);
    let powerPotionCount = gameStateGetResourceCount(state, ResourceType.POT_POWER_POTION);
    let empathyPotionCount = gameStateGetResourceCount(state, ResourceType.POT_EMPATHY);
    if (!args.isAny) {
        if (luckPotionCount > 0) {
            let luckPotionLabel = Labels[ResourceType.POT_LIQUID_LUCK];
            let luckBtnText = `Use a ${luckPotionLabel.l}${luckPotionLabel.icon}<br>(all rolls meet reqs).`;
            let luckButton = createElement(BUTTON, {
                class: CLASS_BTN_TEXT,
                [INNER_HTML]: luckBtnText,
            });
            domAddEventListener(luckButton, EVENT_CLICK, () => {
                eventModalHandleRollClick(eventModal, gameEventState, state, gameEventChild, {
                    ...eventFuncArgs,
                    useLuck: true,
                });
            });
            appendChild(next, luckButton);
            eventModal.diceButtons.push(luckButton);
        }
        if (powerPotionCount > 0) {
            let powerBtnText = `Use a ${highlightResource(ResourceType.POT_POWER_POTION, COLOR_HIGHLIGHT_DARK_TEXT)}<br>(1 additional dice).`;
            let powerButton = createElement(BUTTON, {
                class: CLASS_BTN_TEXT,
                [INNER_HTML]: powerBtnText,
            });
            domAddEventListener(powerButton, EVENT_CLICK, () => {
                powerButton.disabled = true;
                let d = createMagicDice();
                let dice = createDice(state, d, '✨');
                eventModal.diceElements.push(dice);
                eventModal.content.insertBefore(dice.root, eventModal.next);
                eventFuncArgs.diceToRoll.push(d);
                gameStateModifyResource(state, ResourceType.POT_POWER_POTION, -1);
                eventFuncArgs.usePower = true;
            });
            appendChild(next, powerButton);
            eventModal.diceButtons.push(powerButton);
        }
        if (empathyPotionCount > 0) {
            let growMagicDiceHl = highlightResource(ResourceType.DICE_GROW, COLOR_HIGHLIGHT_DARK_TEXT);
            let heartMagicDiceHl = highlightResource(ResourceType.DICE_HEART_MAGIC, COLOR_HIGHLIGHT_DARK_TEXT);
            let empathyBtnText = `Use a ${highlightResource(ResourceType.POT_EMPATHY, COLOR_HIGHLIGHT_DARK_TEXT)}<br>(tmp convert ${growMagicDiceHl} to ${heartMagicDiceHl}).`;
            let empathyButton = createElement(BUTTON, {
                class: CLASS_BTN_TEXT,
                [INNER_HTML]: empathyBtnText,
            });
            domAddEventListener(empathyButton, EVENT_CLICK, () => {
                empathyButton.disabled = true;
                gameStateModifyResource(state, ResourceType.POT_EMPATHY, -1);
                for (let i = 0; i < eventFuncArgs.diceToRoll.length; i++) {
                    let dice = eventFuncArgs.diceToRoll[i];
                    for (let j = 0; j < dice.length; j++) {
                        let face = dice[j];
                        if (face === ResourceType.DICE_GROW) {
                            dice[j] = ResourceType.DICE_HEART_MAGIC;
                        }
                    }
                }
                for (let i = 0; i < eventModal.diceElements.length; i++) {
                    let dice = eventModal.diceElements[i];
                    dice.subRoot[INNER_HTML] = ICON_HEART_MAGIC;
                }
                eventFuncArgs.useEmpathy = true;
            });
            appendChild(next, empathyButton);
            eventModal.diceButtons.push(empathyButton);
        }
    }
};
let eventModalCreateButtonChosenText = (text) => {
    let p = createElement(P, {
        [INNER_HTML]: text,
        class: 'event-chosen-text wtext',
    });
    return p;
};
let MAX_FAVOR = 10;
let createFavorMeter = () => {
    let root = createElement(DIV, {
        class: 'favor-meter',
    });
    let label = createElement(DIV, {
        [INNER_HTML]: "Black Cat's Favor",
    });
    appendChild(root, label);
    let subRoot = createElement(DIV, {
        class: 'favor-meter-sub',
    });
    setStyle(root, {
        width: `${MAX_FAVOR * 24}px`,
    });
    appendChild(root, subRoot);
    return { root, subRoot };
};
let setFavorMeterPct = (favorMeter, numCatsFavor) => {
    clearChildren(favorMeter.subRoot);
    for (let i = 0; i < Math.min(MAX_FAVOR, numCatsFavor); i++) {
        let cat = createElement(DIV, {
            [INNER_HTML]: ICON_CAT,
        });
        appendChild(favorMeter.subRoot, cat);
    }
};
let createGarden = (state, eventState) => {
    let blueprints = gameStateGetGarden(state);
    let root = createElement(DIV, {
        class: 'garden',
    });
    let slots = [];
    let harvestButtons = [];
    let hasGreenThumb = gameStateGetResourceCount(state, ResourceType.EFFECT_GREEN_THUMB) > 0;
    for (let blueprint of blueprints) {
        let gardenSlot = createElement(DIV, {
            class: 'garden-slot',
        });
        let labelObj = Labels[blueprint];
        let gardenLabel = createElement(DIV, {
            [INNER_HTML]: labelObj.l,
            class: 'garden-label',
        });
        let gardenDiceContainer = createElement(DIV, {
            class: 'garden-dice-container',
        });
        let gardenDiceList = createElement(DIV, {
            class: 'garden-dice-list',
        });
        let gardenDiceResult = createElement(DIV, {
            class: 'garden-dice-result flxcr',
        });
        appendChild(gardenSlot, gardenLabel);
        appendChild(gardenSlot, gardenDiceContainer);
        appendChild(gardenDiceContainer, gardenDiceList);
        appendChild(gardenDiceContainer, gardenDiceResult);
        appendChild(root, gardenSlot);
        let magicDice = [...state.magicDice];
        let diceElements = [];
        for (let i = 0; i < magicDice.length; i++) {
            let dice = createDice(state, magicDice[i]);
            diceElements.push(dice);
            appendChild(gardenDiceList, dice.root);
        }
        slots.push({
            magicDice,
            diceList: diceElements,
            type: blueprint,
            resultArea: gardenDiceResult,
            gardenDiceList,
        });
    }
    if (hasGreenThumb) {
        let greenThumbLabel = Labels[ResourceType.EFFECT_GREEN_THUMB];
        let greenThumbText = createElement(P, {
            class: CLASS_BTN_TEXT,
            [INNER_HTML]: `Your ${greenThumbLabel.l}${greenThumbLabel.icon} will let you harvest double.`,
        });
        appendChild(root, greenThumbText);
    }
    let handleHarvestClick = async () => {
        // setStyle(harvestButton, {
        //   visibility: 'hidden',
        //   padding: '0',
        //   margin: '-4px',
        // });
        for (let button of harvestButtons) {
            button.remove();
        }
        gameStateModifyResource(state, ResourceType.EFFECT_GREEN_THUMB, -1);
        let harvestText = eventModalCreateButtonChosenText('Harvest');
        appendChild(root, harvestText);
        let promises = [];
        for (let slot of slots) {
            promises.push(gameRollDiceUi(slot.magicDice.map((d, i) => ({
                dice: d,
                elem: slot.diceList[i],
            })), [ResourceType.DICE_GROW]));
        }
        let diceRolls = await Promise.all(promises);
        let harvestResults = gameHarvest(state, diceRolls.map((r, i) => ({
            resourceType: blueprintToHerb(slots[i].type),
            diceResults: r,
        })), hasGreenThumb ? 2 : 1);
        for (let i = 0; i < harvestResults.length; i++) {
            slots[i].resultArea[INNER_HTML] = '+' + String(harvestResults[i]);
        }
        gameEventRunChild(state, eventState, eventState.event.children[1]);
    };
    let harvestButton = createElement(BUTTON, {
        class: CLASS_BTN_TEXT,
        [INNER_HTML]: 'Harvest',
    });
    domAddEventListener(harvestButton, EVENT_CLICK, handleHarvestClick);
    appendChild(root, harvestButton);
    harvestButtons.push(harvestButton);
    let hasGrowthPotion = gameStateGetResourceCount(state, ResourceType.POT_GROWTH) > 0;
    if (hasGrowthPotion) {
        let growMagicDiceHl = highlightResource(ResourceType.DICE_GROW, COLOR_HIGHLIGHT_DARK_TEXT);
        let potGrowthLabelText = `Use a ${highlightResource(ResourceType.POT_GROWTH, COLOR_HIGHLIGHT_DARK_TEXT)}<br>(adds 1 all ${growMagicDiceHl} dice).`;
        let potOfGrowthButton = createElement(BUTTON, {
            class: CLASS_BTN_TEXT,
            [INNER_HTML]: potGrowthLabelText,
        });
        domAddEventListener(potOfGrowthButton, EVENT_CLICK, () => {
            gameStateModifyResource(state, ResourceType.POT_GROWTH, -1);
            for (let slot of slots) {
                let growDice = createMagicDiceGrow();
                let diceElem = createDice(state, growDice, ICON_GROW);
                slot.diceList.push(diceElem);
                slot.magicDice.push(growDice);
                appendChild(slot.gardenDiceList, diceElem.root);
            }
            // potOfGrowthButton.remove();
            potOfGrowthButton.disabled = true;
            // let potGrowthLabelTextElem =
            //   eventModalCreateButtonChosenText(potGrowthLabelText);
            // prependChild(root, potGrowthLabelTextElem);
        });
        appendChild(root, potOfGrowthButton);
        harvestButtons.push(potOfGrowthButton);
    }
    return { root, slots, harvestButtons };
};
let highlightText = (text, color) => {
    let resource = getResourceFromLabel(text);
    let cbFuncName = `hl('${resource}', this)`;
    // console.log('Highlight', text, resource, cbFuncName);
    return `<${SPAN} class="highlight-text" style="color: ${color};" onclick="${cbFuncName}" onmouseover="${cbFuncName}" onmouseout="${cbFuncName}" >${text}</${SPAN}>`;
};
window.hl = (resource, elem) => {
    // console.log('HL TEXT', resource);
    let cl = 'highlight-text';
    let allElementsWithClass = getElementsByClassName(cl);
    for (let elem of allElementsWithClass) {
        setStyle(elem, { 'text-decoration': 'none' });
    }
    setStyle(elem, { 'text-decoration': 'underline' });
    let hoverDescription = getCurrentState().ui.hoverDescription;
    hoverDescriptionDescribe(hoverDescription, resource);
};
let highlightResource = (resource, color) => {
    let labelObj = Labels[resource];
    return highlightText(labelObj.l, color) + labelObj.icon;
};
let createHoverDescription = () => {
    let root = createElement(DIV, {
        class: 'hover-desc',
    });
    return { root };
};
let hoverDescriptionDescribe = (hoverDescription, resource) => {
    let labelObj = Labels[resource];
    clearChildren(hoverDescription.root);
    let label = createElement(SPAN, {
        class: 'hover-desc-label',
        [INNER_HTML]: labelObj.l + labelObj.icon + ': ',
    });
    appendChild(hoverDescription.root, label);
    let dsc = createElement(SPAN, {
        class: 'hover-desc-dsc',
        [INNER_HTML]: labelObj.dsc,
    });
    appendChild(hoverDescription.root, dsc);
};
let hoverDescriptionDescribeShowDice = (hoverDescription, magicDice) => {
    clearChildren(hoverDescription.root);
    let container = createElement(DIV, {
        class: 'flxcr',
    });
    setStyle(container, {
        height: '48px',
    });
    for (let face of magicDice) {
        let labelObj = Labels[face];
        let label = createElement(DIV, {
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
let createNextBar = () => {
    let root = createElement(DIV, {
        class: 'next-bar flxcr',
    });
    return {
        root,
    };
};
let nextBarSetButtonState = (nextBar, state) => {
    nextBar.nextButton?.remove();
    if (gameStateHasHarvestRoll(state)) {
        let nextButton = createElement(BUTTON, {
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
    }
    else {
        let nextButton = createElement(BUTTON, {
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
let createPrimaryResources = () => {
    let root = createElement(DIV, {
        id: 'primary-resources',
    });
    let herbRoot = createElement(DIV, {
        class: 'primary-resource-column',
    });
    appendChild(root, herbRoot);
    let otherRoot = createElement(DIV, {
        class: 'primary-resource-column',
    });
    appendChild(root, otherRoot);
    return {
        root,
        herbRoot,
        otherRoot,
    };
};
let setPrimaryResources = (primaryResources, state) => {
    clearChildren(primaryResources.herbRoot);
    clearChildren(primaryResources.otherRoot);
    for (let res of HERB_NAMES) {
        let labelObj = Labels[res];
        let herbRow = createElement(DIV, {
            class: 'flxcr primary-resource-row',
        }, [
            createElement(DIV, {
                [INNER_HTML]: highlightText(labelObj.icon + labelObj.l, '#1b631b') + ': ',
            }),
            createElement(DIV, {
                [INNER_HTML]: String(gameStateGetResourceCount(state, res)),
            }),
        ]);
        appendChild(primaryResources.herbRoot, herbRow);
    }
    let otherNames = [...REAGENT_NAMES, ResourceType.GOLD];
    for (let res of otherNames) {
        let labelObj = Labels[res];
        let otherRow = createElement(DIV, {
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
let CLASS_BTN_TEXT = 'btn-text wtext';
let COLOR_HIGHLIGHT_DARK_TEXT = '#02a';
let COLOR_HIGHLIGHT_LIGHT_TEXT = '#adf';
let rand = () => {
    return Math.random();
};
let randInArray = (array) => {
    return array[Math.floor(rand() * array.length)];
};
let randInRange = (min, max) => {
    return Math.floor(rand() * (max - min + 1)) + min;
};
let splitDelimTrim = (text, delim) => {
    return text.split(delim).map(s => s.trim());
};
