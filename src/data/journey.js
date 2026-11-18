export const adventures = [
 {id:1,title:'Create your identity',description:'Create a profile, choose your interests and personalize your avatar.'},
 {id:2,title:'Play games on your own',description:'Practice at your own pace with individual games and puzzles.'},
 {id:3,title:'Play online games',description:'Play with another student who shares your interests. Use reactions to interact while you play.'},
 {id:4,title:'Small-group online games',description:'Work with a small group on a shared Pattern Path puzzle. Communicate through reactions.'},
 {id:5,title:'Solo campus discovery',description:'Explore a public campus location at your own pace and collect a hidden clue.'},
 {id:6,title:'Two-person clue exchange',description:'Meet a compatible explorer and combine your clues to solve a shared puzzle.'},
 {id:7,title:'Campus quests together',description:'Build familiarity with the same three-person group over three positive meetings.'},
 {id:8,title:'A new friendship',description:'Choose whether to share contact details with your familiar companions. Everyone must agree.'}
];
// Final scenario reward amounts: PDF pages 28 and 43. Later stages retain prototype values.
export const rewards = {1:{xp:30,coins:10},2:{xp:50,coins:100,item:'hat',badge:'Puzzle Solver'},3:{xp:80,coins:150,item:'jacket',badge:'Trail Friend'},4:{xp:70,coins:30},5:{xp:60,coins:25},6:{xp:80,coins:35},7:{xp:100,coins:40},8:{xp:120,coins:50},meeting:{xp:25,coins:10}};
export const players = [
 {id:'maple',name:'MapleMoon',face:'👦🏻',hobbies:['Gaming','Reading','TV shows'],contact:'maplemoon@example.com'},
 {id:'trail',name:'TrailBuddy',face:'👩🏽',hobbies:['Hiking','Music','Photography'],contact:'trailbuddy@example.com'},
 {id:'river',name:'RiverScout',face:'👨🏾',hobbies:['Sports','Gaming','Cooking'],contact:'riverscout@example.com'},
 {id:'pine',name:'PineStar',face:'👩🏼',hobbies:['Art','Reading','Movies'],contact:'pinestar@example.com'},
 {id:'cedar',name:'CedarSky',face:'🧑🏻',hobbies:['Writing','Music','Board games'],contact:'cedarsky@example.com'},
 {id:'fern',name:'FernPath',face:'🧑🏽',hobbies:['Photography','Cooking','TV shows'],contact:'fernpath@example.com'}
];
export const freshJourney = {pendingGameRewards:[],rewarded:[],earnedBadges:[],affinity:{},group:null,groups:{},activity:null,clues:[],contacts:[],consents:{},game:null};
export function matchPlayers(state,count=1) {
 return [...players].sort((a,b)=>score(b)-score(a)||players.indexOf(a)-players.indexOf(b)).slice(0,count).map(p=>p.id);
 function score(p){return p.hobbies.filter(h=>state.hobbies.includes(h)).length*10+(state.affinity[p.id]||0)}
}
export function reviewPlayers(state,ids,positive){const affinity={...state.affinity};ids.forEach(id=>{affinity[id]=(affinity[id]||0)+(positive?4:-100)});return {...state,affinity}}
export function reward(state,key,value) {
 if(state.rewarded.includes(key))return state;
 return {...state,rewarded:[...state.rewarded,key],xp:state.xp+value.xp,coins:state.coins+value.coins};
}
export function completeAdventure(state,id) {
 if(state.completed.includes(id)||!state.onboarded|| (id>2&&!state.completed.includes(id-1)))return state;
 if((id===2||id===3)&&(!state.pendingGameRewards.includes(id)||!state.rewarded.includes(`adventure-${id}`)))return state;
 if(id===7&&(!state.group||!(state.groups[state.group]?.positive>=3)))return state;
 if(id===8&&(!state.group||!(state.groups[state.group]?.positive>=3)||!state.groups[state.group].players.every(p=>state.consents[p]?.user&&state.consents[p]?.other)))return state;
 let next=reward({...state,completed:[...state.completed,id]},`adventure-${id}`,rewards[id]);
 if(id===8)next={...next,earnedBadges:[...new Set([...next.earnedBadges,id===2?'Puzzle Solver':'Trail Friend'])]};
 if(id===8)next={...next,contacts:[...state.groups[state.group].players]};
 return next;
}
export function beginActivity(state,id) {
 if(id<4||id>8||state.completed.includes(id)||!state.completed.includes(id-1))return state;
 if(state.activity?.adventure===id&&state.activity.stage!=='done')return state;
 let group=state.group,groups={...state.groups},participants=[];
 if(id===7){
  if(!group){participants=matchPlayers(state,2);group=[...participants].sort().join('-');groups[group]=groups[group]||{players:participants,positive:0,attempts:0}}
  participants=groups[group].players;
 }else if(id===4||id===6) participants=matchPlayers(state,id===4?3:1);
 return {...state,group,groups,activity:{adventure:id,stage:id===4?'puzzle':id===8?'consent':'mission',players:participants,group:id===7?group:null,round:id===7?groups[group].attempts+1:1,selected:null,shared:false,consents:{}}};
}
export function activityAction(state,action,value) {
 const a=state.activity;if(!a)return state;let next=state;
 const stage=stage=>({...state,activity:{...a,stage}});
 if(action==='arrive'&&a.stage==='mission')return stage(a.adventure===5?'clue':a.adventure===6?'exchange':'puzzle');
 if(action==='exchange'&&a.stage==='exchange')return {...stage('puzzle'),activity:{...a,stage:'puzzle',shared:true}};
 if(action==='answer'&&a.stage==='puzzle')return {...state,activity:{...a,selected:value,stage:value==='mountain'?'clue':'puzzle'}};
 if(action==='collect'&&a.stage==='clue') {
  next={...state,clues:[...new Set([...state.clues,`${a.adventure}-${a.group||'solo'}-${a.round}`])],activity:{...a,stage:a.adventure===5?'done':'review'}};
  return a.adventure===5?completeAdventure(next,5):next;
 }
 if(action==='review'&&a.stage==='review') {
  next=reviewPlayers(state,a.players,value);
  if(a.adventure===7){
   const g=next.groups[a.group];next={...next,groups:{...next.groups,[a.group]:{...g,attempts:g.attempts+1,positive:g.positive+(value?1:0)}},group:value?a.group:null};
   next=reward(next,`meeting-${a.group}-${a.round}`,rewards.meeting);
   if(value&&next.groups[a.group].positive>=3)next=completeAdventure(next,7);
  }else next=completeAdventure(next,a.adventure);
  return {...next,feedback:[...next.feedback,{adventure:a.adventure,players:a.players,enjoyed:value,private:!value}],activity:{...a,stage:'done',enjoyed:value}};
 }
 if(action==='consent'&&a.stage==='consent')return {...state,consents:{...state.consents,[value.id]:{...state.consents[value.id],[value.kind]:value.checked}}};
 if(action==='finish'&&a.adventure===8&&a.stage==='consent') {next=completeAdventure(state,8);return next.completed.includes(8)?{...next,activity:{...a,stage:'done'}}:state}
 return state;
}

// Completing a game, claiming its rewards and moving to the next adventure are separate events.
export function finishGamingActivity(state, id) {
  if (!state.onboarded || state.completed.includes(id) || state.pendingGameRewards.includes(id) || (id === 3 && !state.completed.includes(2))) return state;
  return {...state, pendingGameRewards: [...state.pendingGameRewards, id]};
}

export function claimGamingReward(state, id) {
  if (![2, 3].includes(id) || !state.pendingGameRewards.includes(id) || state.completed.includes(id) || state.rewarded.includes(`adventure-${id}`)) return state;
  const value = rewards[id];
  return reward({...state,
    owned: [...new Set([...state.owned, value.item])],
    earnedBadges: [...new Set([...state.earnedBadges, value.badge])],
  }, `adventure-${id}`, value);
}

export function nextGamingAdventure(state, id) {
  if (![2, 3].includes(id) || !state.pendingGameRewards.includes(id) || !state.rewarded.includes(`adventure-${id}`)) return state;
  const next = completeAdventure(state, id);
  if (!next.completed.includes(id)) return state;
  return {...next, pendingGameRewards: next.pendingGameRewards.filter(n => n !== id), game: {...next.game, stage: 'choose'}};
}
