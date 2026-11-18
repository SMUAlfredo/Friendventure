import {test,expect} from '@playwright/test';
import {freshState,finishGame} from '../src/data/catalog.js';
import {beginActivity,activityAction,completeAdventure,reviewPlayers,matchPlayers} from '../src/data/journey.js';
const url='http://127.0.0.1:5175';
const seed=()=>({...freshState(),onboarded:true,profile:{name:'Alex'},hobbies:['Gaming','Reading'],completed:[2,3]});
async function load(page,state){await page.goto(url);await page.evaluate(s=>localStorage.setItem('friendventure-v1',JSON.stringify(s)),state);await page.reload()}
async function button(page,name){await page.getByRole('button',{name,exact:true}).click()}
async function reset(page,accept){page.once('dialog',d=>accept?d.accept():d.dismiss());await button(page,'Reset Demo')}

test('matching, rewards, progression guards and group isolation',()=>{
 let s=seed();const first=matchPlayers(s)[0];expect(matchPlayers(reviewPlayers(s,[first],false))[0]).not.toBe(first);expect(completeAdventure(s,6)).toBe(s);expect(finishGame(s,'online')).toBe(s);
 s={...s,completed:[2,3,4,5,6]};s=beginActivity(s,7);const old=s.group;
 for(let i=0;i<2;i++){s=activityAction(s,'arrive');s=activityAction(s,'answer','mountain');s=activityAction(s,'collect');s=activityAction(s,'review',i===0);if(i===0)s=beginActivity(s,7)}
 expect(s.groups[old].positive).toBe(1);s=beginActivity(s,7);expect(s.group).not.toBe(old);expect(s.groups[s.group].positive).toBe(0);expect(s.contacts).toEqual([]);expect(completeAdventure(s,8)).toBe(s);
});

test('the sketch map keeps adventures 4?8 locked with prior demo progress',async({page})=>{
 await load(page,{...seed(),completed:[2,3,4,5,6,7,8],contacts:[matchPlayers(seed())[0]]});
 await button(page,'Progress');
 const secret=page.getByRole('button',{name:/Secret Adventure/});
 await expect(secret).toHaveCount(5);
 for(const entry of await secret.all())await expect(entry).toBeDisabled();
 await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','38');
 await button(page,'Adventure');
 await expect(page.getByRole('heading',{name:'Adventure 03'})).toBeVisible();
 await button(page,'Friends');
 await expect(page.getByRole('heading',{name:'Contacts Made'})).toBeVisible();
 await expect(page.locator('.contact')).toHaveCount(1);
 await expect(page.locator('.contact button')).toHaveCount(0);
});

test('external reset: cancel, every section, active game, repeated reset',async({page})=>{
 await load(page,seed());await page.evaluate(()=>localStorage.setItem('unrelated-app','keep-me'));
 await expect(page.locator('.app .demo-toolbar')).toHaveCount(0);await expect(page.locator('.demo-toolbar')).toBeVisible();
 const before=await page.evaluate(()=>localStorage.getItem('friendventure-v1'));await reset(page,false);expect(await page.evaluate(()=>localStorage.getItem('friendventure-v1'))).toBe(before);
 for(const section of ['Avatar','Progress','Adventure','Games','Friends','Store']){
  await load(page,seed());await button(page,section);await reset(page,true);await expect(page.getByRole('heading',{name:'Create Profile Before Start'})).toBeVisible();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('');await expect(page.locator('.design-reference')).toContainText('Scenario 1, Screen 1');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('friendventure-v1')));expect(saved).toEqual(freshState());
 }
 await load(page,seed());await button(page,'Games');await button(page,'Play Game →');await button(page,'Choose mountain');await reset(page,false);await expect(page.getByRole('button',{name:'Continue Quest →'})).toBeEnabled();await reset(page,true);await reset(page,true);expect(await page.evaluate(()=>localStorage.getItem('unrelated-app'))).toBe('keep-me');
 await page.setViewportSize({width:320,height:700});await expect(page.locator('.demo-toolbar')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('only the sketched puzzle opens, neutral reactions do not penalize',async({page})=>{
 await load(page,{...freshState(),onboarded:true,hobbies:['Gaming'],completed:[2]});
 await button(page,'Games');
 for(const game of ['Rune Match','Word Trail','Memory','Logic Maze','Clue Hunt'])await expect(page.getByRole('button',{name:game,exact:true})).toBeDisabled();
 await button(page,'Games');await page.getByRole('button',{name:'Online Games / Puzzles'}).click();await button(page,'Pattern Path');await button(page,'Play Game →');
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('friendventure-v1')).affinity);await button(page,'Neutral reaction');expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('friendventure-v1')).affinity)).toEqual(before);
});

