import React, {useEffect} from 'react';
import {Button, Card, ProgressBar} from '../components/UI';

const explanations = {
  2: [
    'Start at your own pace with individual games and puzzles. This adventure is a chance to become familiar with Friendventure before playing with anyone else.',
    'In Games, choose Local Games / Puzzles and select a game. Pattern Path asks you to find the missing symbol in a repeating pattern. Select a symbol, then continue when the pattern is complete.',
    'After finishing, review your rewards, claim them and choose Next Adventure. You can return to local games for more practice; replaying a completed activity keeps your progress.',
  ],
  3: [
    'Your next activity introduces one simulated student through a shared online game. Matching uses the interests you chose in Preferences. Hints come from your companion’s own interests.',
    'Open Games and choose Online Games / Puzzles. Work on the puzzle and use the reaction buttons to respond. There is no chat or voice conversation.',
    'Happy reactions can be shared with your companion. Negative reactions and negative enjoyment feedback stay private and help prioritize a different match later. Neutral reactions do not count as negative feedback.',
    'When the game ends, answer the enjoyment question. You may share optional feedback, replay the game or exit. On Exit, claim the adventure reward and continue to the next adventure.',
  ],
};

export default function AdventureDescription({id, percent, onClose, onReference}) {
  useEffect(() => onReference(`Final UX scenarios — Scenario 2, Screen ${id === 2 ? '2.1' : '6.1'} (PDF page ${id === 2 ? 25 : 31})`), [id, onReference]);
  return <>
    <h1>Current Adventure</h1>
    <ProgressBar value={percent}/>
    <Card className="extended-description">
      <h2>Adventure Description</h2>
      {explanations[id].map(text => <p key={text}>{text}</p>)}
      <div className="actions"><Button secondary onClick={onClose}>Close</Button></div>
    </Card>
  </>;
}
