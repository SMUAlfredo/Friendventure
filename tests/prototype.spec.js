import {test, expect} from '@playwright/test';
import {initialState, finishGame, buyItem, currentAdventure} from '../src/data/catalog.js';
import {claimGamingReward, nextGamingAdventure} from '../src/data/journey.js';

const button = (page, name) => page.getByRole('button', {name, exact: true});
const data = page => page.evaluate(() => JSON.parse(localStorage.getItem('friendventure-v1')));
const confirmDialog = page => page.getByRole('dialog').getByRole('button', {name: 'Confirm', exact: true}).click();
async function fillProfile(page, name = 'Alex') {
  for (const [label, value] of [['Name', name], ['Age', '19'], ['SMU email', 'alex@smu.ca'], ['Student number', 'A00123456'], ['Program of studies', 'Computer Science']]) await page.getByLabel(label, {exact: true}).fill(value);
}
async function savePreferences(page) {
  await button(page, 'Confirm').click();
  await expect(page.getByRole('heading', {name: 'Preferences saved!'})).toBeVisible();
  await page.locator('main').getByRole('button', {name: 'Avatar', exact: true}).click();
}

test('gaming rewards are pending until claimed, never duplicated, and progress requires Next Adventure', () => {
  const starting = {...structuredClone(initialState), onboarded: true};
  const pending = finishGame(starting, 'local');
  expect(pending.xp).toBe(320); expect(pending.coins).toBe(180); expect(currentAdventure(pending)).toBe(2);
  expect(nextGamingAdventure(pending, 2)).toBe(pending);
  const claimed = claimGamingReward(pending, 2);
  expect(claimed.xp).toBe(370); expect(claimed.coins).toBe(280);
  expect(claimGamingReward(claimed, 2)).toBe(claimed);
  const next = nextGamingAdventure(claimed, 2);
  expect(currentAdventure(next)).toBe(3); expect(finishGame(next, 'local')).toBe(next);
});

test('store respects unlocks, balance, and duplicate purchases', () => {
  expect(buyItem(initialState, 'jacket')).toBe(initialState);
  const s = buyItem(initialState, 'backpack'); expect(s.coins).toBe(100); expect(s.owned).toContain('backpack'); expect(buyItem(s, 'backpack')).toBe(s);
});

test('final onboarding: validation, draft confirmation/cancel, saved status, Unselect, delete cancellation and editing', async ({page}) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5175');
  await button(page, 'Confirm').click();
  await expect(page.getByText('Please enter your name.', {exact: true})).toBeVisible();
  await expect(page.getByLabel('Name', {exact: true})).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.design-reference')).toContainText('Screen 2 (PDF page 3)');
  await fillProfile(page); await page.getByLabel('SMU email').fill('bad-email'); await button(page, 'Confirm').click();
  await expect(page.getByText('Please enter a valid email address.', {exact: true})).toBeVisible();
  await page.getByLabel('SMU email').fill('alex@example.com'); await button(page, 'Confirm').click();
  await expect(page.getByText('Please use your SMU email address ending in @smu.ca.', {exact: true})).toBeVisible();
  await page.getByLabel('SMU email').fill('alex@smu.ca'); await button(page, 'Confirm').click();
  await expect(page.getByRole('dialog', {name: 'Do you want to save changes?'})).toHaveText('Do you want to save changes?CancelConfirm');
  await expect(button(page, 'Preferences')).toBeDisabled(); await expect(page.locator('.design-reference')).toContainText('Screen 3 (PDF page 4)');
  await button(page, 'Cancel').click(); expect((await data(page)).profile.name).toBe('');
  await expect(button(page, 'Preferences')).toHaveCount(0);
  await expect(button(page, 'Confirm')).toBeEnabled();
  await expect(page.getByLabel('Name', {exact: true})).toHaveValue('Alex');
  await button(page, 'Confirm').click(); await confirmDialog(page);
  await expect(page.getByText('Information saved!', {exact: true})).toBeVisible(); expect((await data(page)).profile.name).toBe('Alex');
  await expect(page.locator('.design-reference')).toContainText('Screen 4 (PDF page 5)'); await button(page, 'Preferences').click();
  await button(page, 'Gaming').click(); await button(page, 'Reading').click();
  await page.getByRole('button', {name: 'Dropdown list of hobbies'}).click(); await page.getByLabel('Search hobbies').fill('TV'); await button(page, 'TV shows +').click();
  await button(page, 'Confirm').click(); await button(page, 'TV shows').click(); await page.getByLabel('Add details · TV shows').fill('Mystery shows');
  await button(page, 'Confirm').click(); await expect(page.getByRole('heading', {name: 'Review Preferences'})).toBeVisible(); await expect(page.getByLabel('Add details · TV shows')).toHaveCount(0); await expect(button(page, 'Gaming')).toBeVisible(); expect((await data(page)).details['TV shows']).toBe('Mystery shows');
  await button(page, 'Select').click(); await expect(button(page, 'Select')).toHaveCount(0); await expect(button(page, 'Unselect')).toHaveCount(1); await page.getByRole('button', {name: 'Reading', exact: false}).click(); await button(page, 'Unselect').click(); await expect(button(page, 'Delete')).toBeDisabled(); await expect(button(page, 'Select')).toHaveCount(1); await expect(button(page, 'Unselect')).toHaveCount(0); expect((await data(page)).hobbies).toContain('Reading');
  await button(page, 'Select').click(); await page.getByRole('button', {name: 'Reading', exact: false}).click(); await button(page, 'Delete').click();
  await expect(page.getByRole('dialog')).toContainText('Reading'); await button(page, 'Cancel').click(); expect((await data(page)).hobbies).toContain('Reading');
  await button(page, 'Delete').click(); await confirmDialog(page); expect((await data(page)).hobbies).not.toContain('Reading');
  await expect(button(page, 'Undo')).toHaveCount(0); await expect(button(page, 'Select')).toBeVisible();
  await page.reload(); await expect(button(page, 'Confirm')).toBeVisible();
  await button(page, 'Confirm').click(); await confirmDialog(page); await button(page, 'Preferences').click(); await button(page, 'Confirm').click();
  expect((await data(page)).hobbies).not.toContain('Reading'); expect((await data(page)).details['TV shows']).toBe('Mystery shows');
  await button(page, 'Add').click(); await button(page, 'Music').click(); await button(page, 'Confirm').click(); await savePreferences(page);
  await expect(page.getByRole('heading', {name: 'Avatar Personalization'})).toBeVisible(); await expect(page.getByText('Getting Started', {exact: true})).toHaveCount(0);
  await button(page, 'Edit Preferences').click(); await button(page, 'Edit Personal Info').click(); await page.getByLabel('Name', {exact: true}).fill('Alex Explorer');
  await button(page, 'Confirm').click(); await button(page, 'Cancel').click(); expect((await data(page)).profile.name).toBe('Alex');
  await button(page, 'Back').click(); await button(page, 'Edit Personal Info').click(); await expect(page.getByLabel('Name', {exact: true})).toHaveValue('Alex');
  await page.getByLabel('Name', {exact: true}).fill('Alex Explorer'); await button(page, 'Confirm').click(); await confirmDialog(page); await button(page, 'Preferences').click();
  await expect(page.getByRole('heading', {name: 'Review Preferences'})).toBeVisible(); await expect(page.getByText('Getting Started', {exact: true})).toHaveCount(0);
  await button(page, 'TV shows').click(); await button(page, 'Confirm').click(); await expect(page.getByRole('heading', {name: 'Review Preferences'})).toBeVisible(); await expect(page.getByRole('heading', {name: 'Preferences saved!'})).toHaveCount(0); await expect(page.getByLabel('Add details · TV shows')).toHaveCount(0); await savePreferences(page);
  await page.screenshot({path: '.reference/final/avatar-implemented.png', fullPage: true}); expect(errors).toEqual([]);
});

test('final gaming: extended descriptions, exact reward claims, feedback branches, Replay/Exit, persistence and later unlock', async ({page}) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5175');
  await page.evaluate(s => localStorage.setItem('friendventure-v1', JSON.stringify(s)), {...structuredClone(initialState), onboarded: true, hobbies: ['Gaming', 'Reading'], completed: []}); await page.reload();
  await button(page, 'Adventure').click(); await expect(page.locator('#adventure-summary')).toHaveText(/.+/); await expect(page.locator('.current-activity button')).toHaveCount(1); await expect(page.locator('.current-activity .puzzle-grid, .current-activity .symbol, .current-activity p')).toHaveCount(0); await button(page, 'Adventure Description').click(); await expect(page.locator('.design-reference')).toContainText('Screen 2.1 (PDF page 25)'); await button(page, 'Close').click(); await expect(page.getByRole('heading', {name: 'Adventure 02'})).toBeVisible();
  await page.getByRole('button', {name: 'Go to Games Section'}).click(); await expect(page.getByRole('button', {name: 'Online Games / Puzzles'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Play Game'}).click(); await expect(button(page, 'Game settings')).toBeDisabled();
  await button(page, 'Choose leaf').click(); await expect(page.getByRole('button', {name: 'Continue Quest'})).toBeDisabled(); await button(page, 'Choose mountain').click(); await page.getByRole('button', {name: 'Continue Quest'}).click();
  await expect(page.getByText('You have finished your first adventure.', {exact: true})).toBeVisible(); await expect(page.locator('.design-reference')).toContainText('Screen 4.1 (PDF page 28)'); await expect(button(page, 'Next Adventure')).toBeDisabled();
  expect((await data(page)).xp).toBe(320); await button(page, 'Claim Reward').click(); expect((await data(page)).xp).toBe(370); expect((await data(page)).coins).toBe(280); await expect(button(page, 'Reward Claimed')).toBeDisabled();
  await page.reload(); await button(page, 'Games').click(); await expect(button(page, 'Reward Claimed')).toBeDisabled(); expect((await data(page)).xp).toBe(370); await button(page, 'Next Adventure').click();
  await button(page, 'Adventure').click(); await expect(page.locator('#adventure-summary')).toHaveText(/.+/); await expect(page.locator('.current-activity button')).toHaveCount(1); await expect(page.locator('.current-activity .puzzle-grid, .current-activity .symbol, .current-activity p')).toHaveCount(0); await button(page, 'Adventure Description').click(); await expect(page.locator('.design-reference')).toContainText('Screen 6.1 (PDF page 31)'); await button(page, 'Close').click();
  await button(page, 'Games').click(); await page.getByRole('button', {name: 'Online Games / Puzzles'}).click(); await page.getByRole('button', {name: 'Play Game'}).click(); await expect(page.getByText('MapleMoon sent you a happy reaction', {exact: false})).toBeVisible();
  await button(page, 'Angry reaction').click(); await expect(page.locator('.game-notice')).toContainText('Saved privately'); await button(page, 'Happy reaction').click(); await expect(page.locator('.game-notice')).toContainText('shared with MapleMoon');
  await button(page, 'Choose mountain').click(); await page.getByRole('button', {name: 'Continue Quest'}).click(); await button(page, 'No').click(); await expect(button(page, 'Confirm')).toHaveCount(0); await expect(page.getByText('Anything you would like to share with us?', {exact:true})).toBeVisible(); expect((await data(page)).feedback.at(-1).enjoyed).toBe(false); await button(page, 'Yes').click(); await page.getByLabel('Tell us what happened').fill('I prefer shorter games.'); await button(page, 'Send').click();
  await page.getByRole('button', {name: 'Replay'}).click(); await expect(page.getByRole('heading', {name: 'Online Game', exact: true})).toBeVisible(); await expect(page.getByRole('button', {name: 'Continue Quest'})).toBeDisabled();
  await button(page, 'Choose mountain').click(); await page.getByRole('button', {name: 'Continue Quest'}).click(); await button(page, 'Yes').click(); await expect(button(page, 'Confirm')).toHaveCount(0); await expect(page.getByRole('button', {name:'Replay'})).toBeVisible(); expect((await data(page)).feedback.at(-1).enjoyed).toBe(true); await expect(page.locator('.design-reference')).toContainText('Screen 13 (PDF page 38)'); await button(page, 'Exit').click();
  await expect(page.locator('.design-reference')).toContainText('Screen 17.1 (PDF page 43)'); expect((await data(page)).completed).toEqual([2]);
  await button(page, 'Claim Reward').click(); const claimed = await data(page); expect(claimed.xp).toBe(450); expect(claimed.coins).toBe(430); expect(claimed.owned).toContain('jacket'); expect(claimed.earnedBadges).toContain('Trail Friend');
  await page.screenshot({path: '.reference/final/online-reward-implemented.png', fullPage: true}); await button(page, 'Next Adventure').click(); expect((await data(page)).completed).toEqual([2, 3]);
  await button(page, 'Store').click(); await button(page, 'Buy').click(); expect((await data(page)).coins).toBe(350);
  await button(page, 'Avatar').click(); await page.getByRole('button', {name: 'Avatar Items'}).click(); await page.getByRole('button', {name: 'Backpack', exact: false}).click(); await button(page, 'Confirm').click(); await expect(page.getByRole('img', {name: /backpack/})).toBeVisible();
  await page.reload(); expect((await data(page)).xp).toBe(450); expect((await data(page)).feedback.some(f => f.text === 'I prefer shorter games.')).toBeTruthy();
  for (const width of [320, 390, 768, 1280]) { await page.setViewportSize({width, height: 900}); for (const section of ['Avatar', 'Progress', 'Adventure', 'Games', 'Friends', 'Store']) { await button(page, section).click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${section} overflow at ${width}`).toBeTruthy(); } }
  expect(errors).toEqual([]);
});
import {validateProfile} from '../src/data/profile.js';

test('profile validation explains formats without inventing student-number verification', () => {
  const valid = {name: 'Alex', age: '19', email: 'alex@smu.ca', studentNumber: 'A00123456', program: 'Computer Science'};
  expect(validateProfile(valid)).toEqual({});
  expect(validateProfile({...valid, age: '19.5'}).age).toContain('positive whole number');
  expect(validateProfile({...valid, age: '-2'}).age).toContain('positive whole number');
  expect(validateProfile({...valid, studentNumber: '   '}).studentNumber).toContain('student number');
  expect(validateProfile({...valid, studentNumber: 'demo-student'})).toEqual({});
  expect(validateProfile({...valid, email: 'alex@student.smu.ca'})).toEqual({});
});

test('Reset Demo also clears pending or claimed completion rewards while cancel preserves them', async ({page}) => {
  await page.goto('http://127.0.0.1:5175');
  const pending = finishGame({...structuredClone(initialState), onboarded: true}, 'local');
  await page.evaluate(s => {
    localStorage.setItem('friendventure-v1', JSON.stringify({...s, game: {mode: 'local', name: 'Pattern Path', stage: 'reward'}}));
    localStorage.setItem('unrelated-demo', 'preserve');
  }, pending);
  await page.reload(); await button(page, 'Games').click(); await button(page, 'Claim Reward').click();
  const before = await data(page); page.once('dialog', d => d.dismiss()); await button(page, 'Reset Demo').click();
  expect(await data(page)).toEqual(before); await expect(button(page, 'Reward Claimed')).toBeDisabled();
  page.once('dialog', d => d.accept()); await button(page, 'Reset Demo').click();
  await expect(page.getByRole('heading', {name: 'Create Profile Before Start'})).toBeVisible();
  const fresh = await data(page); expect(fresh.xp).toBe(320); expect(fresh.coins).toBe(180); expect(fresh.pendingGameRewards).toEqual([]); expect(fresh.rewarded).toEqual([]); expect(fresh.game).toBe(null);
  expect(await page.evaluate(() => localStorage.getItem('unrelated-demo'))).toBe('preserve');
});
