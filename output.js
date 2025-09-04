document.write('<meta content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" name=viewport><title>Witch Potion</title><style>:root{--prim1:#000;--bg1:#aaa;--bg2:#fff}body{background-color:#000;color:#fff;font-family:Courier,monospace;font-size:18px}button{display:block;font-size:inherit;border-radius:8px}button:disabled{background-color:#aaa;text-decoration:line-through}.wh{width:100%;height:100%}.btext{color:#000}.wtext{color:#fff}.flxcr{display:flex;justify-content:center;align-items:center}#game-container{display:flex;justify-content:center;align-items:center}#game{max-width:500px;background-color:#ddd;position:relative;overflow:hidden}#primary-resources{display:flex;justify-content:space-around}.icon{filter:grayscale(50%);background:#111;border-radius:99px;cursor:default;margin-left:2px;display:inline-block}.calendar-square{width:42px;height:42px;padding:2px;border:1px solid #000;display:inline-block;background:#ddd}.calendar-square-active{background-color:#fff;border-color:#09a}.modal{background:#aaa;width:100%;position:absolute;bottom:64px;height:calc(100% - 174px - 64px - 64px);padding:8px;box-sizing:border-box}.hover-desc{position:absolute;top:174px;background:#000;height:64px;width:calc(100% - 16px);padding:8px;color:#fff}.highlight-text{cursor:default}.event-content{padding:8px;background-color:#fff;max-height:calc(100% - 16px);overflow-y:auto}.event-title{display:flex;align-items:center;justify-content:center}.event-title-icon{font-size:64px;text-align:center;width:100%}.event-title-text{font-size:1.5rem;font-weight:700;text-align:center}.event-choice-text{background:#000;padding:2px;text-align:center}.event-chosen-text{background:#ccc;color:#222;padding:2px;text-align:center}.event-next{margin-bottom:100px}.btn-text{color:#000;background:#eee;width:100%;padding:8px;margin:4px 0;font-family:Courier,monospace}.btn-text:active{background-color:#aaa}.primary-resource-column{width:45%}.primary-resource-row{justify-content:space-between;width:100%;border-bottom:1px solid #aaa;box-sizing:border-box}.garden{padding:0;margin-bottom:64px}.garden-slot{width:calc(100% - 16px);margin:8px;background:#fff}.garden-label{font-weight:700;font-style:italic}.garden-dice-container{display:flex}.garden-dice-list{display:flex;width:calc(100% - 64px)}.garden-dice-result{width:calc(64px);font-size:1.5rem;font-weight:700}.bottom-bar{position:absolute;bottom:0;width:100%;height:64px;background:#ddd}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.dice{display:inline-block;width:42px;height:42px;background:#fff;border:1px solid #000;border-radius:4px;padding:4px;margin:4px}.moon-anim{font-size:2rem;text-align:center}.favor-meter{border:1px solid #000;text-align:center}.favor-meter-sub{display:flex}</style><div class=wh id=game-container><div class="wh btext" id=game></div></div>');let h={event:{icon:"",title:"",children:[{id:"harvest",type:"garden",p:"You may now harvest your garden."},{re:!0,id:"day",type:"choice",p:"You are at your shop. What would you like to do today?",choices:[{text:"Visit the reagent merchant.",next:"merch"},{text:"Mix potions.",next:"pot"},{text:"View inventory.",next:"inv"},{text:"End the day.",next:"nextDay"}]},{id:"nextDay",type:"end"}]},evalVars:{},currentChildId:"default"},R="div",A="button",y="p",T="span",v="innerHTML",g="click",i="mouseover",a=()=>document.getElementById("game"),E=(e,t)=>{for(var r in t)e.style[r]=t[r]},C=(e,t={},r=[])=>{var o,a,i=document.createElement(e);for(o in t)o===v?i.innerHTML=t[o]:i.setAttribute(o,t[o]);for(a of r)i.appendChild(a);return i},O=(e,t)=>{e.appendChild(t)},I=e=>{e[v]=""},D=(e,t,r)=>{e.addEventListener(t,r)};var L,s,e,u,r;let p=t=>new Promise(e=>setTimeout(e,t));function B(e){return structuredClone(e)}let f=",";class F{lines=[];currentLine=0;parseMultipleEvents(e){let r=[],t=[];var o,a=e=>{try{var t=this.parseEventString(e);r.push(t)}catch(e){}};for(o of e.trim().split("\n")){var i=o.trim();i.startsWith("#")&&0<t.length?(a(t.join("\n")),t=[i]):t.push(i)}return 0<t.length&&a(t.join("\n")),r}parseEventString(e){if(this.lines=l(e.trim(),"\n").filter(e=>0<e.length),this.currentLine=0,!(e=this.lines[this.currentLine]).startsWith("#"))throw new Error("Event must start with # followed by title and icon");if(!(e=e.match(/^#(.+?),(.+)$/)))throw new Error("Invalid header format. Expected: #Title,icon_name");for(var t=e[1].trim(),e=e[2].trim(),r=(this.currentLine++,[]),o={title:t,icon:e,children:r,vars:{}};this.currentLine<this.lines.length;){var a=this.parseChild(o);a&&r.push(a)}return o}parseChild(e){if(this.currentLine>=this.lines.length)return null;var t=this.lines[this.currentLine];if(t.startsWith("@")){if(o=t.match(/^(@.+)=(.+)$/))return r=o[1].trim(),o=o[2].trim(),e.vars[r]={str:o,parsed:void 0},this.currentLine++,null;throw new Error("Invalid variable format: "+t)}if(!t.startsWith(">"))return this.currentLine++,null;if(!(e=t.match(/^>([\d\w]+|[a-z]),(\w+):?$/)))throw new Error(`Invalid child format at line ${this.currentLine+1}: `+t);for(var r=e[1],o=e[2],a=(this.currentLine++,{id:r,type:o});this.currentLine<this.lines.length;){var i=this.lines[this.currentLine];if(i.startsWith(">"))break;if(i.startsWith("+p:")){var s=i.substring(3).trim();a.p=s}else if(i.startsWith("+c:")){if("choice"!==a.type)throw new Error("Cannot add choice to non-choice child: "+a.id);a.choices||(a.choices=[]),s=this.parseChoice(i),a.choices.push(s)}else if(i.startsWith("+dice:")){a.rolls||(a.rolls=[]);var n=this.parseDice(i);a.rolls.push(...n)}else if(i.startsWith("+pass:"))n=i.substring(6).trim(),a.pass=n;else if(i.startsWith("+fail:")){var l=i.substring(6).trim();a.fail=l}else if(i.startsWith("+add:")||i.startsWith("+rem:"))a.mod||(a.mod=[]),l=this.parseResources(i),a.mod.push(...l);else if(i.startsWith("+next:")){if("choice"===a.type)throw new Error("Cannot add next to choice child: "+a.id);a.next=i.substring(6).trim()}this.currentLine++}return a}parseChoice(e){var[e,t,r]=l(e.slice(3),"|");return{text:t,conditionText:r,next:e}}parseDice(e){var t=e.match(/^\+dice:(.+)$/);if(!t)throw new Error("Invalid dice format: "+e);var r,e=t[1].trim(),o=[];for(r of l(e,"|")){var a=r.match(/^(.*)$/);if(!a)throw new Error("Invalid dice format string: "+r);a=a[1],o.push(a)}return o}parseResources(e){var t=e.startsWith("+add:"),r=e.startsWith("+rem:");if(!t&&!r)throw new Error("Invalid resource line: "+e);var o,e=e.substring(t?5:6).trim(),a=[];for(o of l(e,"|")){var i=o.match(/^(.*)$/);if(!i)throw new Error("Invalid resource format: "+o);i=i[1],a.push(r?"-"+i:i)}return a}}let k=(e,t)=>{var r=$(t);q(e,r,t),X(r,t);let o=e.ui.eventModal;o?xe(o,r):(o=Me(r),O(a(),o.root)),e.ui.eventModal=o,b(e,r,w(r,r.currentChildId))},b=(e,t,r)=>{var o,a=e.ui.eventModal;if(!a)throw new Error("Cannot run child: No event modal found");if("end"===r.type)"nextDay"===r.id?ce(e):"eIntro"===r.id?(e.day=0,ce(e,"Tomorrow you start your first day as a witch.")):(o=B(h),fe(e,o),Re(e,o),_e(e,o),b(e,o,o.event.children[0]));else{if(r.p&&(r.p=V(r.p,U)),r.choices)for(var i of r.choices)i.text=V(i.text,U),i.parsedCondition||(i.parsedCondition=j(e,t,i.conditionText));if(r.rolls){r.parsedRolls=[];for(var s of r.rolls){var[n,l]=Q(s);for(let e=0;e<n;e++)r.parsedRolls.push(l)}}if(r.mod){r.parsedMod=[];for(var d of r.mod){var[d,c]=Q(d);r.parsedMod.push({amt:d,resource:c}),pe(e,t,r,c,d)}}r.re&&(t=B(h),fe(e,t),Re(e,t),_e(e,t)),Se(a,r,t,e),ze(e.ui.res,e),ke(e.ui.favorMeter,G(e,L.FAVOR_CAT))}},w=(e,t)=>{if("e"===t)return{id:"e",type:"end"};var r=e.event.children.find(e=>e.id===t);if(r)return r;throw new Error(`Cannot getChild: Child with id ${t} not found in event `+e.event.title)},$=e=>({event:e,currentChildId:e.children[0].id,evalVars:{}}),K=(e,t,a,i)=>{let r=e=>{let t=(e=>{if(e.includes("RAND")){var t=e.slice(4).split("_"),r=parseInt(t[0]),t=parseInt(t[1]);if(isNaN(r)||isNaN(t))throw new Error("Invalid RAND amount: "+e);return Y(r,t)}if(r=parseInt(e),isNaN(r))throw new Error("Invalid ARG amount: "+e);return r})(a[0]),r="y"===a[1],o=[];for(;0===o.length&&0<t;)o=r?e.filter(e=>ve(i,e,t)):e,t--;return 0===o.length?[0,L.GOLD]:[t+1,W(o)]},o={[s.FUNC_RANDOM_HERB_TIER_1]:()=>r(J),[s.FUNC_RANDOM_HERB_TIER_2]:()=>r(Z),[s.FUNC_RANDOM_HERB_ANY]:()=>r(c),[s.FUNC_RANDOM_REAGENT_TIER_1]:()=>r(te),[s.FUNC_RANDOM_REAGENT_TIER_2]:()=>r(re),[s.FUNC_RANDOM_REAGENT_ANY]:()=>r(ee),[s.FUNC_RANDOM_POTION_TIER_1]:()=>r(P.filter(e=>e!==L.POT_LIQUID_LUCK)),[s.FUNC_RANDOM_POTION_ANY]:()=>r(P),[s.FUNC_RANDOM_GOLD]:()=>r([L.GOLD]),[s.FUNC_RANDOM_FIRE_MAGIC]:()=>r([L.DICE_FIRE_MAGIC]),[s.FUNC_RANDOM_HEART_MAGIC]:()=>r([L.DICE_HEART_MAGIC]),[s.FUNC_RANDOM_GROW]:()=>r([L.DICE_GROW])}[t];if(o)return o();throw new Error(`Unknown resource function: "${t}" after parsing "${e}"`)},V=(e,t)=>{let r=e;if(e.includes("<span"))return e;var o,a,i,s,n={};for([o,a]of Object.entries(L))n[a]=o;for([i,s]of Object.entries(n)){var l=N[i];if(!l)throw new Error("Unknown enum value: "+i);l=""+d(l.l,t)+N[i].icon,r=r.replaceAll(s,l)}return r},j=(o,e,t)=>{if(!t)return()=>!0;var r,a=l(t,f);let i=[];for(r of a){var s=(r=>{if(r=z(r,u.HAS_RESOURCE)){let[e,t]=Q(r[1].join(" "));return()=>ve(o,t,e)}})(r);s&&i.push(s)}if(0===i.length)throw new Error("Unknown condition format: "+t);return()=>i.every(e=>e())},n=(e,t)=>{for(var[r,o]of Object.entries(t))e=e.replaceAll(r,o);return e},Q=e=>2===(e=e.split(" ")).length?[parseInt(e[0]),Ce(e[1])]:[1,L.GOLD],z=(t,r)=>{if(t=t.match(new RegExp(`(${r??".*"})\\(([^)]*)\\)`))){let e=t[1];return"-"===e[0]&&(e=e.slice(1)),r=l(t[2]," "),[e,r,t[0]]}},q=(e,t,r)=>{for(var o in r.vars){var a,i,s=r.vars[o],n=z(s.str);n?(i=t.evalVars[o])?s.parsed=i:([i,n,a]=n,[a,i]=K(a,i,n,e),s.parsed=n=a+" "+i,t.evalVars[o]=n):(s.parsed=s.str,t.evalVars[o]=s.str)}},X=(t,e)=>{for(var r of e.children){if(r.p&&(r.p=n(r.p,t.evalVars)),r.choices)for(var o of r.choices)o.text=n(o.text,t.evalVars),o.conditionText&&(o.conditionText=n(o.conditionText,t.evalVars));if(r.rolls)for(let e=0;e<r.rolls.length;e++){var a=r.rolls[e];r.rolls[e]=n(a,t.evalVars)}if(r.mod)for(let e=0;e<r.mod.length;e++){var i=r.mod[e];r.mod[e]=n(i,t.evalVars)}}},c=((e=L=L||{}).GOLD="GOLD",e.HERB_SPARKLEWEED="HERB_SPARKLEWEED",e.HERB_BRAMBLEBERRY="HERB_BRAMBLEBERRY",e.HERB_SPECIALPETAL="HERB_SPECIALPETAL",e.REAG_SKY_DUST="REAG_SKY_DUST",e.REAG_SUN_POWDER="REAG_SUN_POWDER",e.POT_COLD_CURE="POT_COLD_CURE",e.POT_DRAGON_SWEAT="POT_DRAGON_SWEAT",e.POT_MIASMA_OF_MIDNIGHT="POT_MIASMA_OF_MIDNIGHT",e.POT_TINCTURE_OF_TASTE="POT_TINCTURE_OF_TASTE",e.POT_EMPATHY="POT_EMPATHY",e.POT_GROWTH="POT_GROWTH",e.POT_LIQUID_LUCK="POT_LIQUID_LUCK",e.POT_POWER_POTION="POT_POWER_POTION",e.DICE_FIRE_MAGIC="DICE_FIRE_MAGIC",e.DICE_HEART_MAGIC="DICE_HEART_MAGIC",e.DICE_GROW="DICE_GROW",e.DICE_ANY="ANY",e.DICE_NEW="DICE_NEW",e.BLUEPRINT_SPARKLEWEED="BLUEPRINT_SPARKLEWEED",e.BLUEPRINT_BRAMBLEBERRY="BLUEPRINT_BRAMBLEBERRY",e.BLUEPRINT_SPECIALPETAL="BLUEPRINT_SPECIALPETAL",e.CONTRACT_VILLAGER="CONTRACT_VILLAGER",e.CONTRACT_CAT="CONTRACT_CAT",e.FAVOR_CAT="FAVOR_CAT",e.EFFECT_COLD="EFFECT_COLD",e.EFFECT_GREEN_THUMB="EFFECT_GREEN_THUMB",[L.HERB_SPARKLEWEED,L.HERB_BRAMBLEBERRY,L.HERB_SPECIALPETAL]),J=[L.HERB_SPARKLEWEED,L.HERB_BRAMBLEBERRY],Z=[L.HERB_SPECIALPETAL],ee=[L.REAG_SKY_DUST,L.REAG_SUN_POWDER],te=[L.REAG_SKY_DUST],re=[L.REAG_SUN_POWDER],P=[L.POT_COLD_CURE,L.POT_DRAGON_SWEAT,L.POT_MIASMA_OF_MIDNIGHT,L.POT_TINCTURE_OF_TASTE,L.POT_GROWTH,L.POT_POWER_POTION,L.POT_LIQUID_LUCK],oe=[L.BLUEPRINT_SPARKLEWEED,L.BLUEPRINT_BRAMBLEBERRY,L.BLUEPRINT_SPECIALPETAL],ae={[L.REAG_SKY_DUST]:2,[L.REAG_SUN_POWDER]:3},ie={[L.POT_COLD_CURE]:[L.HERB_BRAMBLEBERRY,L.REAG_SKY_DUST],[L.POT_DRAGON_SWEAT]:[L.HERB_SPARKLEWEED,L.REAG_SKY_DUST],[L.POT_MIASMA_OF_MIDNIGHT]:[L.HERB_SPARKLEWEED,L.HERB_SPARKLEWEED,L.REAG_SKY_DUST],[L.POT_TINCTURE_OF_TASTE]:[L.HERB_BRAMBLEBERRY,L.HERB_BRAMBLEBERRY,L.REAG_SKY_DUST],[L.POT_GROWTH]:[L.REAG_SKY_DUST,L.REAG_SUN_POWDER],[L.POT_EMPATHY]:[L.HERB_BRAMBLEBERRY,L.HERB_BRAMBLEBERRY,L.HERB_SPARKLEWEED,L.HERB_SPARKLEWEED,L.REAG_SUN_POWDER],[L.POT_POWER_POTION]:[L.HERB_SPECIALPETAL,L.REAG_SUN_POWDER],[L.POT_LIQUID_LUCK]:[L.HERB_BRAMBLEBERRY,L.HERB_SPARKLEWEED,L.HERB_SPECIALPETAL,L.REAG_SUN_POWDER]},t=((e=s=s||{}).FUNC_RANDOM_HERB_TIER_1="HERB1",e.FUNC_RANDOM_HERB_TIER_2="HERB2",e.FUNC_RANDOM_HERB_TIER_3="HERB3",e.FUNC_RANDOM_HERB_ANY="HERB",e.FUNC_RANDOM_REAGENT_TIER_1="REAG1",e.FUNC_RANDOM_REAGENT_TIER_2="REAG2",e.FUNC_RANDOM_REAGENT_ANY="REAG",e.FUNC_RANDOM_POTION_TIER_1="POT1",e.FUNC_RANDOM_POTION_ANY="POT",e.FUNC_RANDOM_GOLD="GOLD",e.FUNC_RANDOM_FIRE_MAGIC="FIRE",e.FUNC_RANDOM_HEART_MAGIC="HEART",e.FUNC_RANDOM_GROW="GROW",(u=u||{}).HAS_RESOURCE="HAS","🧴"),se="♥️",ne='<span style="filter: grayscale(100%)">🐈‍⬛</span>',_="🌱",N={[L.DICE_FIRE_MAGIC]:{l:"Fire Magic",icon:"🔥",dsc:"Used to fend off your enemies."},[L.DICE_HEART_MAGIC]:{l:"Heart Magic",icon:se,dsc:"Can guide situations and people."},[L.DICE_GROW]:{l:"Grow",icon:_,dsc:"Used to grow your magical garden."},[L.DICE_ANY]:{l:"Any",icon:"🎲",dsc:"Any magic dice."},[L.GOLD]:{l:"Gold",icon:"💰",dsc:"Merchants love it."},[L.HERB_SPARKLEWEED]:{l:"Sparkleweed",icon:"🌿",dsc:"A glittery weed."},[L.HERB_BRAMBLEBERRY]:{l:"Brambleberry",icon:"🌿",dsc:"Magical berries that make potion bases."},[L.HERB_SPECIALPETAL]:{l:"Specialpetal",icon:"🌿",dsc:"Rare flower for rare potions."},[L.REAG_SKY_DUST]:{l:"Sky Dust",icon:"🧪",dsc:"Common dust collected on magical clouds."},[L.REAG_SUN_POWDER]:{l:"Sun Powder",icon:"🧪",dsc:"Rare ground-up sunbeams."},[L.POT_COLD_CURE]:{l:"Cold Cure",icon:t,dsc:"Instantly cures the common cold."},[L.POT_DRAGON_SWEAT]:{l:"Dragon Sweat",icon:t,dsc:"Immunity to fire."},[L.POT_MIASMA_OF_MIDNIGHT]:{l:"Miasma of Midnight",icon:t,dsc:"Sleep until midnight exactly."},[L.POT_TINCTURE_OF_TASTE]:{l:"Tincture of Taste",icon:t,dsc:"Makes any food taste better."},[L.POT_EMPATHY]:{l:"Empathy Potion",icon:t,dsc:"Grants supernatural empathy."},[L.POT_LIQUID_LUCK]:{l:"Liquid Luck",icon:t,dsc:"Grants luck."},[L.POT_POWER_POTION]:{l:"Power Potion",icon:t,dsc:"The power within you is amplified."},[L.POT_GROWTH]:{l:"Growth Potion",icon:t,dsc:"Increases growth."},[L.CONTRACT_VILLAGER]:{l:"Contract",icon:"📃",dsc:"A simple request."},[L.CONTRACT_CAT]:{l:"Cat",icon:"📃",dsc:"A complex request."},[L.FAVOR_CAT]:{l:"Cat's Favor",icon:ne,dsc:"Your standing with the Black Cat."},[L.BLUEPRINT_SPARKLEWEED]:{l:"Seed of Sparkleweed",icon:_,dsc:"Allows you 1 additional Sparkleweed seed bed."},[L.BLUEPRINT_BRAMBLEBERRY]:{l:"Seed of Brambleberry",icon:_,dsc:"Allows you 1 additional Brambleberry seed bed."},[L.BLUEPRINT_SPECIALPETAL]:{l:"Seed of Specialpetal",icon:_,dsc:"Allows you 1 additional Specialpetal seed bed."},[L.DICE_NEW]:{l:"Magic Dice",icon:"🎲",dsc:"A new magic dice."},[L.EFFECT_COLD]:{l:"Cold",icon:"🤧",dsc:"You have a cold."},[L.EFFECT_GREEN_THUMB]:{l:"Green Thumbs",icon:_,dsc:"Your thumbs are bright green."}};for(r in N)N[r].icon=`<${T} class="icon">${N[r].icon}</${T}>`;let o=e=>{var t,r=e.lastIndexOf(">");for(t in-1<r&&(e=e.slice(r+1)),N)if(N[t].l.toLowerCase()===e.toLowerCase())return t},le=["Giant Frog","Giant Spider","Medusa","Cyclops","Ogre","Troll","Phoenix","Hydra","Minotaur","Griffon","Golem","Wraith","Demon","Lich","Giant","Wyrm"],de,ce=(t,r)=>{Se(t.ui.eventModal,{id:"1",type:"modify",p:r??"You close up your shop for the day."},{event:t.events[t.day],evalVars:{},currentChildId:"1"},t);let o=C(y,{class:"moon-anim"});O(t.ui.eventModal.content,o);for(let e=0;e<2;e++)O(t.ui.eventModal.content,C("br"));let a=[..."🌕🌕🌕🌕🌖🌗🌘🌑🌒🌓🌔🌕🌕🌕🌕"];for(let e=0;e<a.length;e++)p(100*e).then(()=>{o[v]=a[e],He(t.ui.eventModal)});t.day++,p(100*a.length).then(()=>{o.remove();var e=C(y,{[v]:"---<br>Day "+t.day});O(t.ui.eventModal.content,e),He(t.ui.eventModal),r||we(t.ui.calendar),0===G(t,L.FAVOR_CAT)?k(t,de):k(t,t.events[t.day])})},he=(t,e,r=1)=>{var o,a=[];for(o of e){var i=o.diceResults.filter(e=>e===L.DICE_GROW).length;a.push(i);for(let e=0;e<i*r;e++)t.res.push(o.resourceType)}return ze(t.ui.res,t),a},ue=e=>W(e),Ee=async(e,o,a=!1)=>{var i=[],s=[];for(let r of e){let t=a?o[0]:ue(r.dice);s.push(Ge(r.elem,t,600,2).then(()=>{var e=N[t].icon;Ne(r.elem,e),E(r.elem.root,{borderColor:o.includes(t)?"green":"red",background:o.includes(t)?"green":"unset"})})),await p(250),i.push(t)}return await Promise.all(s),i},pe=(e,t,r,o,a)=>{var i,s=(t,r)=>{for(var o of e.magicDice)for(let e=0;e<o.length;e++)o[e]===t&&(o[e]=r)};o===L.CONTRACT_VILLAGER?(i=me(t.event),t=e.events.indexOf(t.event),e.events.splice(t+7,0,i.event)):o===L.DICE_NEW?e.magicDice.push(ye()):o!==L.DICE_FIRE_MAGIC&&(o===L.DICE_HEART_MAGIC?s(L.DICE_FIRE_MAGIC,L.DICE_HEART_MAGIC):o===L.DICE_GROW?s(L.DICE_FIRE_MAGIC,L.DICE_GROW):o===L.EFFECT_COLD?p(1).then(()=>{ce(e,"You take a day to rest and recover.")}):(m(e,o,a),oe.includes(o)&&(e.vars.avblBlueprints=e.vars.avblBlueprints.filter(e=>e!==o))))},fe=(e,t)=>{var r,o,a,i=[],s={...ae};for([r,o]of Object.entries(s))i.push({text:`Buy 1 ${r} for ${o} `+L.GOLD,next:"buy_"+r,conditionText:`HAS(${o} ${L.GOLD})`}),t.event.children.push({id:"buy_"+r,type:"modify",p:`You buy ${r} for ${o} ${L.GOLD}.`,mod:[`-${o} `+L.GOLD,"1 "+r],next:"merch"});for(a of c)e.res.includes(a)&&(i.push({text:`Sell 1 ${a} for 1 `+L.GOLD,next:"sell_"+a}),t.event.children.push({id:"sell_"+a,type:"modify",p:`You sell 1 ${a} for 1 ${L.GOLD}.`,mod:["-1 "+a,"1 "+L.GOLD],next:"merch",re:!0}));i.push({text:"Go back.",next:"day"}),t.event.children.push({id:"merch",type:"choice",p:'"What\'re you buying?"',choices:i})},Re=(e,t)=>{var r,o,a=[],i=[...c,...ee],s={...ie};for([r,o]of Object.entries(s)){var n=[];for(let t of i){var l=o.filter(e=>e===t).length;0<l&&n.push(l+" "+t)}var d=G(e,r);a.push({text:`Brew 1 ${r} (${d}) for <br>`+n.join("<br>"),next:"brew_"+r,conditionText:n.map(e=>`HAS(${e})`).join(f)}),t.event.children.push({id:"brew_"+r,type:"modify",p:`You make a ${r}.`,mod:[...n.map(e=>"-"+e),"1 "+r],next:"pot",re:!0})}a.push({text:"Go back.",next:"day"}),t.event.children.push({id:"pot",type:"choice",p:"At the mixing table you can concoct magical potions.",choices:a})},_e=(t,e)=>{var r=P.map(e=>({res:e,count:G(t,e)}));e.event.children.push({id:"inv",type:"modify",p:"Here's what you have:"+r.map(e=>` <br>${e.res} (${e.count})`).join(""),next:"day"})},me=e=>(e=e.vars["@A"].parsed,$({title:"The villager returns",icon:"📜",children:[{id:"0",type:"choice",p:"The villager from last week returns to collect their promised potion:<br>"+e,choices:[{text:"Give them the potion.",next:"1",conditionText:`HAS(${e})`},{text:"Say you cannot help. The Black Cat will be most displeased.",next:"2"}]},{id:"1",type:"modify",p:"You sell the potion to the villager.",mod:["-"+e,"3 GOLD"],next:"e"},{id:"2",type:"modify",p:"The disappointed villager leaves.",mod:["-2 FAVOR_CAT"],next:"e"}]})),Ae=(addEventListener("load",async()=>{var d=Ae(),c=(window.state=d,Be(30)),c=(O(a(),c.root),d.ui.calendar=c,Qe()),c=(d.ui.res=c,O(a(),c.root),ze(c,d),Ke()),c=(O(a(),c.root),Ve(c,L.DICE_FIRE_MAGIC),d.ui.hoverDescription=c,Ie());O(a(),c.root),d.ui.favorMeter=c.favorMeter;{var c=d,h=(new F).parseMultipleEvents(`#The Game,🐈‍⬛
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
  +c: 2|No.|HAS(999 GOLD)`);let e=t=>h.find(e=>e.title===t),t=e("The Game"),r=e("Villager Contract"),o=e("The Black Cat"),a=e("Attack!"),i=e("Herb Merchant"),s=e("The End"),n=[t,r,o,a,i,s,de=e("Expulsion")],l=h.filter(e=>!n.includes(e));for(let e=0;e<7;e++){var u,E=W(le),p=B(a);for(u of p.children)u.p=u.p?.replace("monster","<b>"+E+"</b>");l.splice(Y(0,l.length-1),0,p)}for(let e=0;e<4;e++){var f=B(i);l.splice(Y(0,l.length-1),0,f)}var R=l.sort(()=>Math.random()-.5);for(let e=0;e<4;e++){var _=B(r);R.splice(7*e+Y(0,6),0,_)}for(let e=0;e<4;e++){var m=B(o);R.splice(7*e+6,0,m)}var A=B(t),y=((T=A.children.slice(-2)[0]).mod=["3 GOLD","1 HERB_SPARKLEWEED","1 HERB_BRAMBLEBERRY","1 REAG_SKY_DUST","1 REAG_SUN_POWDER"],W(P)),T=(T.mod.push("1 "+y),[A,...R,s]);c.events=T}d.day=0,be(d.ui.calendar,0);for(let e=0;e<5;e++)d.res.push(L.FAVOR_CAT);k(d,d.events[0])}),()=>{var e={events:[],day:0,res:[],magicDice:[ye()],harvestRoll:[],ui:{},vars:{avblBlueprints:[L.BLUEPRINT_SPECIALPETAL]}};return e.res.push(L.BLUEPRINT_SPARKLEWEED,L.BLUEPRINT_BRAMBLEBERRY),e}),ye=()=>[L.DICE_FIRE_MAGIC,L.DICE_FIRE_MAGIC,L.DICE_HEART_MAGIC,L.DICE_HEART_MAGIC,L.DICE_GROW,L.DICE_GROW],Te=()=>{var t=[];for(let e=0;e<6;e++)t.push(L.DICE_GROW);return t},m=(t,r,o)=>{var a,i=Math.abs(o);for(let e=0;e<i;e++)0<o?t.res.push(r):-1!==(a=t.res.indexOf(r))&&t.res.splice(a,1)},G=(e,t)=>e.res.filter(e=>e===t).length,ve=(e,t,r)=>G(e,t)>=r,ge=e=>e.res.filter(e=>oe.includes(e)),Ce=e=>{for(var t of Object.values(L))if(e===t)return t;throw new Error("Unknown resource type: "+e)},Oe=e=>{switch(e){case L.BLUEPRINT_SPARKLEWEED:return L.HERB_SPARKLEWEED;case L.BLUEPRINT_BRAMBLEBERRY:return L.HERB_BRAMBLEBERRY;case L.BLUEPRINT_SPECIALPETAL:return L.HERB_SPECIALPETAL;default:throw new Error("Unknown blueprint: "+e)}},Ie=()=>{var e=C(R,{class:"bottom-bar flxcr"}),t=Fe();return O(e,t.root),ke(t,5),{root:e,favorMeter:t}},De="calendar-square-active",Le=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Be=t=>{var e=C(R,{}),r=(E(e,{width:48*t+"px"}),C(R,{}));E(r,{transition:"transform 0.3s ease-in-out"}),O(e,r);for(let e=0;e<t;e++){var o=C(R,{class:"calendar-square",[v]:e+1+". "+Le[e%7]});O(r,o)}return{root:e,subRoot:r,day:0}},be=(e,t)=>{e.day=t-1,we(e)},we=e=>{e.day++,e.subRoot.style.transform=`translateX(-${48*e.day}px)`;var t=e.subRoot.children[e.day];t&&t.classList.add(De),(t=e.subRoot.children[e.day-1])&&t.classList.remove(De)},Pe=`<${T} class="icon">❓</${T}>`,M=(e,t,r=Pe)=>{var o=C(R,{class:"dice"}),a=()=>{je(e.ui.hoverDescription,t)},a=(D(o,g,a),D(o,i,a),C(R,{class:"flxcr wh",[v]:r}));return O(o,a),{root:o,subRoot:a}},Ne=(e,t)=>{e.subRoot[v]=t},Ge=(t,r,o,a)=>new Promise(e=>{E(t.root,{animation:`spin ${o/a}ms linear `+a}),Ne(t,Pe),setTimeout(()=>{E(t.root,{animation:""}),Ne(t,r),e()},o)}),Me=e=>{var t=C(R,{id:"event-modal",class:"modal"}),r=C(R,{class:"event-content btext"}),o={root:t,content:r,choices:C(R,{class:"event-next"}),next:C(R,{class:"event-next"}),diceButtons:[],diceElements:[]};return xe(o,e),O(r,o.choices),O(r,o.next),O(t,o.content),o},xe=(e,t)=>{var e=e.content,r=t.event.icon;(r="🐈‍⬛"===r?ne:r)&&(r=C(R,{class:"event-title-icon",[v]:r}),O(e,r)),t.event.title&&(r=C(y,{class:"event-title-text",[v]:t.event.title}),O(e,r))},x=(e,t)=>{var r=V(t.resource,U),t=0<t.amt?"+"+t.amt:t.amt,t=Ye(t+" "+r);O(e,t)},Se=(t,r,o,a)=>{let{content:i,choices:e,next:s}=t,n,l,{}=o,d=(I(s),s.remove(),I(e),e.remove(),C(y,{[v]:r.p}));if(O(i,d),"garden"===r.type&&(n=$e(a,o),O(i,n.root)),r.rolls){var c,h=r.parsedRolls[0]===L.DICE_ANY,u=C(y,{[v]:h?"Try it out!":"To pass: "});O(i,u);for(c of r.parsedRolls){var E=C(T,{[v]:N[c].icon});O(u,E)}t.diceElements=[];var p=B(a.magicDice);for(let e=0;e<a.magicDice.length;e++){var f=M(a,p[e]);t.diceElements.push(f),O(i,f.root)}We(t,r,o,a,{isAny:h,diceToRoll:p}),O(i,s)}if(r.parsedMod)for(var R of r.parsedMod)x(i,R);if(r.next&&(l=C(A,{class:H,[v]:"e"===r.next?"Done":"Next"}),D(l,g,()=>{var e=w(o,r.next);b(a,o,e)}),O(s,l),O(i,s)),r.choices){for(let t of r.choices){var _=!t?.parsedCondition(),m={class:H,[v]:t.text},_=(_&&(m.disabled="disabled"),C(A,m));D(_,g,()=>{var e=Ye(t.text),e=(O(i,e),w(o,t.next));b(a,o,e)}),O(e,_)}O(i,e)}He(t)},He=e=>{e.content.scrollTo({top:e.content.scrollHeight,behavior:"smooth"})},Ue=async(e,t,r,o,a)=>{let{content:i,diceButtons:s,diceElements:n}=e;for(let e=0;e<s.length;e++){var l=s[e];0===e?E(l,{visibility:"hidden"}):l.remove()}var d,e=a.diceToRoll.slice(),c=await Ee(e.map((e,t)=>({dice:e,elem:n[t]})),o.parsedRolls,a.useLuck);let h=!0;for(d of o.parsedRolls){var u=c.indexOf(d);if(-1===u){h=!1;break}c.splice(u,1)}p(1e3).then(()=>{var e=C(y,{[v]:a.isAny?"":h?"Pass!":"Fail!"}),e=(O(i,e),a.useLuck&&(m(r,L.POT_LIQUID_LUCK,-1),x(i,{amt:-1,resource:L.POT_LIQUID_LUCK})),a.usePower&&x(i,{amt:-1,resource:L.POT_POWER_POTION}),a.useEmpathy&&x(i,{amt:-1,resource:L.POT_EMPATHY}),w(t,h?o.pass:o.fail));b(r,t,e)})},We=(a,e,t,i,r)=>{let s={isAny:r.isAny,useLuck:!1,useDouble:!1,usePower:!1,useEmpathy:!1,diceToRoll:r.diceToRoll};a.diceButtons=[];var n=a.next,o=C(A,{class:H,[v]:"Roll."}),o=(D(o,g,()=>{Ue(a,t,i,e,s)}),O(n,o),a.diceButtons.push(o),G(i,L.POT_LIQUID_LUCK)),l=G(i,L.POT_POWER_POTION),d=G(i,L.POT_EMPATHY);if(!r.isAny){if(0<o&&(o=`Use a ${(r=N[L.POT_LIQUID_LUCK]).l}${r.icon}<br>(all rolls meet reqs).`,r=C(A,{class:H,[v]:o}),D(r,g,()=>{Ue(a,t,i,e,{...s,useLuck:!0})}),O(n,r),a.diceButtons.push(r)),0<l){let e=`Use a ${S(L.POT_POWER_POTION,U)}<br>(1 additional dice).`,r=C(A,{class:H,[v]:e});D(r,g,()=>{r.disabled=!0;var e=ye(),t=M(i,e,"✨");a.diceElements.push(t),a.content.insertBefore(t.root,a.next),s.diceToRoll.push(e),m(i,L.POT_POWER_POTION,-1),s.usePower=!0}),O(n,r),a.diceButtons.push(r)}if(0<d){let e=S(L.DICE_GROW,U),t=S(L.DICE_HEART_MAGIC,U),r=`Use a ${S(L.POT_EMPATHY,U)}<br>(tmp convert ${e} to ${t}).`,o=C(A,{class:H,[v]:r});D(o,g,()=>{o.disabled=!0,m(i,L.POT_EMPATHY,-1);for(let e=0;e<s.diceToRoll.length;e++){var t=s.diceToRoll[e];for(let e=0;e<t.length;e++)t[e]===L.DICE_GROW&&(t[e]=L.DICE_HEART_MAGIC)}for(let e=0;e<a.diceElements.length;e++)a.diceElements[e].subRoot[v]=se;s.useEmpathy=!0}),O(n,o),a.diceButtons.push(o)}}},Ye=e=>C(y,{[v]:e,class:"event-chosen-text wtext"}),Fe=()=>{var e=C(R,{class:"favor-meter"}),t=C(R,{[v]:"Black Cat's Favor"}),t=(O(e,t),C(R,{class:"favor-meter-sub"}));return E(e,{width:"240px"}),O(e,t),{root:e,subRoot:t}},ke=(t,r)=>{I(t.subRoot);for(let e=0;e<Math.min(10,r);e++){var o=C(R,{[v]:ne});O(t.subRoot,o)}},$e=(a,i)=>{var e,t=ge(a);let s=C(R,{class:"garden"}),n=[],l=[],d=0<G(a,L.EFFECT_GREEN_THUMB);for(e of t){var r=C(R,{class:"garden-slot"}),o=N[e],o=C(R,{[v]:o.l,class:"garden-label"}),c=C(R,{class:"garden-dice-container"}),h=C(R,{class:"garden-dice-list"}),u=C(R,{class:"garden-dice-result flxcr"}),E=(O(r,o),O(r,c),O(c,h),O(c,u),O(s,r),[...a.magicDice]),p=[];for(let e=0;e<E.length;e++){var f=M(a,E[e]);p.push(f),O(h,f.root)}n.push({magicDice:E,diceList:p,type:e,resultArea:u,gardenDiceList:h})}if(d&&(t=N[L.EFFECT_GREEN_THUMB],t=C(y,{class:H,[v]:`Your ${t.l}${t.icon} will let you harvest double.`}),O(s,t)),t=C(A,{class:H,[v]:"Harvest"}),D(t,g,async()=>{for(var e of l)e.remove();m(a,L.EFFECT_GREEN_THUMB,-1);var t=Ye("Harvest"),o=(O(s,t),[]);for(let r of n)o.push(Ee(r.magicDice.map((e,t)=>({dice:e,elem:r.diceList[t]})),[L.DICE_GROW]));var t=await Promise.all(o),r=he(a,t.map((e,t)=>({resourceType:Oe(n[t].type),diceResults:e})),d?2:1);for(let e=0;e<r.length;e++)n[e].resultArea[v]="+"+String(r[e]);b(a,i,i.event.children[1])}),O(s,t),l.push(t),0<G(a,L.POT_GROWTH)){let e=S(L.DICE_GROW,U),t=`Use a ${S(L.POT_GROWTH,U)}<br>(adds 1 all ${e} dice).`,o=C(A,{class:H,[v]:t});D(o,g,()=>{m(a,L.POT_GROWTH,-1);for(var e of n){var t=Te(),r=M(a,t,_);e.diceList.push(r),e.magicDice.push(t),O(e.gardenDiceList,r.root)}o.disabled=!0}),O(s,o),l.push(o)}return{root:s,slots:n,harvestButtons:l}},d=(e,t)=>{var r=`hl('${o(e)}', this)`;return`<${T} class="highlight-text" style="color: ${t};" onclick="${r}" onmouseover="${r}" onmouseout="${r}" >${e}</${T}>`},S=(window.hl=(e,t)=>{var r;for(r of document.getElementsByClassName("highlight-text"))E(r,{"text-decoration":"none"});E(t,{"text-decoration":"underline"}),t=window.state.ui.hoverDescription,Ve(t,e)},(e,t)=>(e=N[e],d(e.l,t)+e.icon)),Ke=()=>({root:C(R,{class:"hover-desc"})}),Ve=(e,t)=>{var t=N[t],r=(I(e.root),C(T,{class:"hover-desc-label",[v]:t.l+t.icon+": "})),r=(O(e.root,r),C(T,{class:"hover-desc-dsc",[v]:t.dsc}));O(e.root,r)},je=(e,t)=>{I(e.root);var r,o=C(R,{class:"flxcr"});E(o,{height:"48px"});for(r of t){var a=N[r],a=C(R,{class:"dice flxcr",[v]:a.icon});E(a,{display:"inline-flex"}),O(o,a)}O(e.root,o)},Qe=()=>{var e=C(R,{id:"primary-resources"}),t=C(R,{class:"primary-resource-column"}),r=(O(e,t),C(R,{class:"primary-resource-column"}));return O(e,r),{root:e,herbRoot:t,otherRoot:r}},ze=(e,t)=>{I(e.herbRoot),I(e.otherRoot);for(var r of c){var o=N[r],o=C(R,{class:"flxcr primary-resource-row"},[C(R,{[v]:d(o.icon+o.l,"#1b631b")+": "}),C(R,{[v]:String(G(t,r))})]);O(e.herbRoot,o)}var a;for(a of[...ee,L.GOLD]){var i=N[a],i=C(R,{class:"flxcr primary-resource-row"},[C(R,{[v]:d(i.icon+i.l,"#009")+": "}),C(R,{[v]:String(G(t,a))})]);O(e.otherRoot,i)}},H="btn-text wtext",U="#02a",qe=()=>Math.random(),W=e=>e[Math.floor(qe()*e.length)],Y=(e,t)=>Math.floor(qe()*(t-e+1))+e,l=(e,t)=>e.split(t).map(e=>e.trim());