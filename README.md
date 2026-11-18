# Friendventure

**Current source of truth:** the final November 16 update and its reference mapping are documented below under “Final UX update”. Those notes supersede the earlier scenario/reward descriptions in this implementation history.

A self-contained React / JavaScript / JSX / plain CSS / Vite UX prototype. The first three adventures work locally; the map shows five locked Secret Adventure slots. No backend, real accounts, GPS, bookings, chat, or external APIs.

The current interface follows the final Scenario 1 and 2 sketches, plus the Store and Contacts Made sketches from the comparison PDF. Pattern Path is the playable puzzle. The other game slots and the gear are visible as disabled controls. The implementation history below describes earlier demo extensions, including the removed adventure, puzzle, settings and contact detail screens.

## Run

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. Production: `npm run build`, then `npm run preview`.

```sh
npm test
```

Tests start/reuse Vite on port 5175 and use installed Google Chrome through Playwright. Change the configured channel if using a different installed browser.

## Structure and changed files

- `src/App.jsx`: existing navigation, shared persistent state, external toolbar and centralized reset lifecycle.
- `src/App.css`: existing visual system plus styles for additional missions and external demo utilities.
- `src/data/catalog.js`: original hobby, item, badge and game catalogs; fresh-state factory, purchases, progression integration.
- `src/data/journey.js` (new): eight adventure definitions, centralized prototype rewards, fictional profiles, matching, group identity, encounter actions and consent gates.
- `src/components/UI.jsx`: existing reusable UI, badge scrolling/earned states and item availability.
- `src/components/GamePuzzle.jsx` (new): interactive mechanics for the remaining existing game names.
- `src/pages/Onboarding.jsx`: preserved onboarding and edit flows; reference state reporting.
- `src/pages/Games.jsx`: preserved gaming flow, shared-interest matching, reaction semantics, persistent play/feedback state and reference reporting.
- `src/pages/Journey.jsx` (new): adventures 4–8, campus simulations, clue exchange, repeated meetings and mutual consent.
- `src/pages/Friends.jsx` (new): gated contact collection and approved fictional contact detail view.
- `tests/prototype.spec.js`: original scenario regression checks.
- `tests/journey.spec.js` (new): progression guards, matching, group continuity, full later journey, reset and reference labels.
- `playwright.config.js`: installed-Chrome checks and automatic test server.

## Adventure progression

1. **Create your identity:** existing profile → preferences → review → Avatar flow. First Steps badge.
2. **Individual games:** complete a local puzzle. Puzzle Solver badge. Online category remains a locked `???` until completion.
3. **One-to-one online game:** compatible fictional companion, actual shared-interest hints, reactions, enjoyment feedback, written feedback branch, Replay and Exit.
4. **Small-group online puzzle:** three fictional companions plus the user, shared Pattern Path and reactions, a collected clue and feedback.
5. **Solo campus discovery:** view public-location and duration information, explicitly simulate arrival, collect a clue.
6. **Two-person clue exchange:** explicitly simulate arrival, exchange a companion clue, combine information in a puzzle, collect a clue and review the encounter.
7. **Repeated campus quests:** three-person group with a stable identity. Every encounter requires arrival, puzzle, clue collection and review. Three positive meetings with the same group are required. Negative feedback reduces affinity and matches a different group on the next attempt. Each group retains its own qualifying counter.
8. **Friendship and contacts:** user consent and explicitly simulated companion consent are required for both eligible group members. Friends then shows their approved fictional contact methods. Trail Friend badge.

Future adventures display Secret Adventure until unlocked. Opening a screen never completes an activity. Rewards are awarded once per adventure and once per distinct completed meeting; replaying a game does not grant its milestone reward again.

The original starting balances are **320 XP / 180 coins**. Adventure reward values, not specified in the PDFs, are centralized in `journey.js`. The onboarding reward is added after confirmation. Store names, prices and XP gates are retained: Explorer Hat 60 / 50 XP; Trail Backpack 80 / 100 XP; Forest Jacket 200 / 500 XP. The initial hat and boots are owned/equipped. Unowned equipment stays visible but cannot be equipped until purchased. Purchased items become selectable from both item interfaces.

## Matching and persistence

Fictional profiles have stable nicknames, appearances, hobbies and `example.com` contacts. Matching ranks actual hobby overlap and persistent interaction affinity. Positive reactions can be shared. Angry/unhappy reactions and negative reviews remain private and reduce future matching priority. Neutral/surprised reactions do not penalize matching. There is no unrestricted communication.

Shared React state persists under the single localStorage key `friendventure-v1`: profile, hobbies/details, items, balances, rewards, badges, milestones, game selection/play/feedback state, matching affinity, active mission, clues, group identities/counters, consents and contacts. An interrupted mission resumes when returning to its adventure. On refresh the app opens Avatar; Games resumes its saved state when reopened. Memory retains matched pairs rather than a transient flip animation.

## External presentation controls

The toolbar is a sibling **outside** `.app`, below the prototype on mobile and desktop. It is not part of the Friendventure UI or navigation.

- **Design based on original UX sketches** appears only for reference-derived screens. Verified Scenario 1 slide references cover the profile, hobby picker/review and avatar/item states. Scenario 2 slide references cover maps, adventures 2–3 and the original Pattern Path gaming/feedback states. The Store and contact list cite the comparison PDF's original sketch pages 6 and 5. Settings, newly implemented game mechanics, adventures 4–8, the empty Friends state and contact detail view have no label.
- **Reset Demo** is available from every screen. Cancel leaves all state intact. Confirm removes only `friendventure-v1` and remounts the complete application session, cancelling active component state/timers and restoring fresh defaults at Create Profile. The normal persistence effect writes the clean initial state again. Other browser storage is untouched. There are no extra developer controls; proceed normally to demonstrate the journey.

## References and simulation limits

All three supplied PDFs were visually inspected. Updated Scenario 1 and Scenario 2 take priority over the comparison PDF. The PDFs are unchanged. Their final notes pages are not additional application screens.

The original screens retain the top navigation and forest-green/cream design. Fonts, colors and dimensions are reconstructed, not a pixel-identical export; the original HTML source and individual assets were not supplied. The avatar uses inline SVG, and emoji rendering varies by OS. Most hobby cards in the sketches are unnamed, so labels are representative mock content.

Only Pattern Path's mechanics were illustrated in the references. The extension brief authorizes simple mechanics for the other existing game names; Memory, Rune Match, Word Trail, Logic Maze and Clue Hunt now use small functional prototype puzzles without claiming these rules came from sketches. Their new puzzle views have no original-sketch labels.

All multiplayer actions, campus attendance, clue exchanges, feedback submission and companion consent remain local simulations. Campus missions explicitly say simulation and offer Simulate arrival; no GPS or real booking is implied. Location is a generic public campus library entrance, not a verified campus itinerary. Contact information is fictional. The gear opens settings; its sound setting records a preference, but no audio assets were supplied.

## Validation

The browser suite covers both approved scenarios, the complete remaining journey, separate group counts after negative feedback, consent gates, store rewards/purchases, persistence, original/new screen labels, cancellation and repeated resets, resetting from all six sections and adventures 4–8, and resetting during an active game. Responsive checks include all sections at 320, 390, 768 and 1280 pixels. Rendered screenshots are retained in ignored `.reference/` for visual comparison.

## Final UX update — November 16, 2026

The authoritative reference is now `Friendventure_Updated_Scenarios_Uniform_Feedback_Final.pdf` (44 pages), visually inspected in full. Its updated 19 onboarding states and 21 gaming states override the older scenario PDFs. All reference PDFs remain unchanged.

### Scenario 1 changes

- Profile fields use a local draft. Confirm validates required fields, email syntax, an SMU address (`smu.ca`, including subdomains), and a positive whole-number age. The sketch explicitly requests an SMU email; there is no account lookup or university verification. No student-number format was supplied, so only a nonempty student number is required.
- Useful field-level errors and an error summary are separate from the Confirm label improvement. Errors are associated with their inputs for assistive technology.
- A save-confirmation card asks whether to save changes. Cancel keeps the draft available for correction without saving it; Back abandons an edit. Confirm commits the profile, displays **Information saved!**, then Preferences returns to the appropriate preference screen.
- Review uses one selection toggle: Select enters selection mode and changes to Unselect; Unselect exits selection mode and clears the marks. Deleting requires an explicit Cancel/Confirm dialog listing the affected hobbies. There is no Undo action; Cancel in the deletion confirmation preserves the hobbies.
- When hobby details are expanded, the first Confirm closes Add details and keeps the hobby list visible. Confirm pressed again saves preferences and advances.
- Confirming preferences displays **Preferences saved!** and the welcome/status view before Avatar. Returning to edit profile or hobbies does not grant the onboarding reward again.
- Avatar, framed item control, equipped states, vertical item scrolling and horizontal badges retain their established layout. Personal information remains reachable through Edit Preferences, matching the sketches' single edit button on Avatar.

### Scenario 2 changes

- Adventure Description is now a labeled button. It opens the extended explanation from final screens **2.1 / 6.1** (PDF pages 25 / 31); Close returns to the same adventure. Go to Games remains a separate direct route. The body copy expands the already-defined activity concept because the sketches contain placeholder lines rather than complete explanation text.
- Existing local/online selection, games, reactions, enjoyment branches, written feedback and labeled Replay/Exit are retained. Negative reactions are private; neutral and surprised reactions do not count as negative and no longer use the negative selected-state color.
- First local completion opens screen **4.1** (PDF page 28): **50 XP / 100 credits**, badge and hat. Online completion follows the feedback process; Exit opens screen **17.1** (PDF page 43): **80 XP / 150 credits**, badge and clothing item.
- Complete, Claim Reward and Next Adventure are distinct persisted transitions. Claim Reward updates the shared XP, wallet, collection and badges exactly once; Next Adventure updates the map/unlock only after claiming. Replays never repeat a completion reward. Reward screens resume after refresh through Games.
- The two gaming-completion sketches say “first” and “second adventure,” while their current-adventure sketches show existing milestones 2 and 3. The demo preserves those eight-adventure IDs and reproduces the completion wording rather than renumbering or removing onboarding.
- The reward sketches draw unnamed badge/item symbols: a hat on page 28 and a shirt on page 43. These map to the existing **Puzzle Solver + Explorer Hat**, and **Trail Friend + Forest Jacket** catalog entries, respectively. No new badge or product was invented. The Forest Jacket is the closest existing clothing item, not an exact copy of the shirt drawing. A hat already owned is not duplicated. The credit label uses the same existing coin wallet, not a new currency.
- Existing completed adventures, balances and purchases are retained. The update does not retroactively recalculate old rewards or reset saved progress; the final reference amounts apply to newly completed gaming milestones.

### Heuristic scope

H1: profile/preference saved status and explicit completion/reward feedback. H3: cancel, the Select/Unselect toggle and existing exits. H5: validation and confirmation before saving/deleting. H6: labeled preference editing, interactive Adventure Description and Replay/Exit. H7: direct profile/preferences editing without repeating onboarding. H9: helpful profile-field error messages. H10 is **partial**, through contextual adventure explanations only. H4/H8 visual conventions are maintained. No full tutorial, help center, payment flow or later-adventure redesign was added. Annotation colors are not used as literal new UI colors.

### Files for this update

New: `src/data/profile.js`, `src/components/Confirmation.jsx`, `src/pages/Completion.jsx`, `src/pages/AdventureDescription.jsx`.

Modified: `src/App.jsx`, `src/App.css`, `src/pages/Onboarding.jsx`, `src/pages/Games.jsx`, `src/data/catalog.js`, `src/data/journey.js`, `tests/prototype.spec.js`, `tests/journey.spec.js`, `playwright.config.js`, `README.md`.

Matching, campus visits, clue exchange and companion consent remain local simulations. Later adventures, store prices, contacts and external reset behavior are preserved. Sketch labels now cite final screen identifiers and verified PDF pages; newly invented game mechanics and later missions are still not labeled as original sketches.

Dependencies remain unchanged (`npm install --offline` succeeded using installed/cached packages). Run `npm run dev`, `npm test`, and `npm run build` as before. The browser suite checks the final validation/confirmation/recovery states and both gaming reward flows as well as the retained later journey and reset controls. The PDF's original source assets/fonts are unavailable; the existing approximated visual assets remain in use.

Friends remains a locked mystery (🔒 / ???) until Adventure 8 has been completed and contacts unlocked. Names, contact details, progress, requirements and sketch labels are hidden beforehand.

The current-adventure overview shows an Adventure Description block with a brief summary; pressing the whole block opens the full explanation. Current Activity contains only its Go to Games Section control, with no game or puzzle preview.

Game Over records the Yes/No answer immediately: Yes proceeds directly to the thank-you screen with Replay/Exit; No proceeds directly to optional additional feedback. There is no extra Confirm step.

Final Game Over feedback follows sketches 13/17: a larger framed rectangular thank-you message and two equally sized square Replay/Exit controls, with large icons and explicit labels.

The Did you enjoy the game? screen reuses the final thank-you panel dimensions: the same rectangular message box and two equally sized square Yes/No controls.

The optional-feedback view follows sketch 15: the same framed thank-you rectangle sits above a separate outlined box containing Anything you would like to share with us? and its compact Yes/No controls, aligned left and right inside that box.
