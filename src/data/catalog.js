import {freshJourney,finishGamingActivity} from './journey.js';
﻿export const hobbies = ['Reading', 'Gaming', 'Music', 'Movies', 'TV shows', 'Hiking', 'Photography', 'Cooking', 'Art', 'Sports', 'Writing', 'Board games'];
export const items = [
 {id:'hat',name:'Explorer Hat',icon:'🎩',price:60,xp:50},
 {id:'backpack',name:'Trail Backpack',short:'Backpack',icon:'🎒',price:80,xp:100},
 {id:'boots',name:'Trail Boots',icon:'🥾'},
 {id:'jacket',name:'Forest Jacket',icon:'🧥',price:200,xp:500}
];
export const badges = [{name:'First Steps',icon:'🌿'},{name:'Puzzle Solver',icon:'🧩'},{name:'Trail Friend',icon:'🏕️'}];
export const games = ['Rune Match', 'Word Trail', 'Memory', 'Pattern Path', 'Logic Maze', 'Clue Hunt'];
export const initialState = {profile:{name:'',age:'',email:'',studentNumber:'',program:''},onboarded:false,hobbies:[],details:{},...freshJourney,equipped:['hat','boots'],owned:['hat','boots'],xp:320,coins:180,completed:[],reactions:[],feedback:[],purchases:[]};
export function finishGame(state,mode) {
 return finishGamingActivity(state,mode==='local'?2:3);
}
export function buyItem(state,id) {
 const item=items.find(x=>x.id===id);
 if(!item?.price || state.owned.includes(id) || state.xp<item.xp || state.coins<item.price) return state;
 return {...state,coins:state.coins-item.price,owned:[...state.owned,id],purchases:[...state.purchases,id]};
}
export function currentAdventure(state) {if(!state.onboarded)return 1;for(let n=2;n<=8;n++)if(!state.completed.includes(n))return n;return 8;}
export function freshState(){return structuredClone(initialState)}

