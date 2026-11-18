import React from 'react';
import {Button, Card, ProgressBar} from '../components/UI';
import {items, badges} from '../data/catalog';
import {claimGamingReward, nextGamingAdventure, rewards} from '../data/journey';

export default function Completion({state, update, id, onNext}) {
  const value = rewards[id];
  const claimed = state.rewarded.includes(`adventure-${id}`);
  const item = items.find(i => i.id === value.item);
  const badge = badges.find(b => b.name === value.badge);
  return <>
    <h1>Current Adventure</h1>
    <ProgressBar value={Math.round((1 + state.completed.filter(id => id === 2 || id === 3).length) / 8 * 100)}/>
    <Card className="completion-card">
      <h2>Congratulations!</h2>
      <p>You have finished your {id === 2 ? 'first' : 'second'} adventure.</p>
      <section className="completion-rewards">
        <h2>Rewards</h2>
        <div className="reward-pair"><div><span>{badge.icon}</span><strong>{badge.name}</strong></div><div><span>{item.icon}</span><strong>{item.name}</strong></div></div>
        <div className="stats"><Card>⭐ {value.xp} XP</Card><Card>🪙 {value.coins} credits</Card></div>
      </section>
      {claimed && <p className="save-status" role="status">Reward claimed! Your XP, credits, badge and item are saved.</p>}
      <div className="actions completion-actions">
        <Button disabled={claimed} onClick={() => update(s => claimGamingReward(s, id))}>{claimed ? 'Reward Claimed' : 'Claim Reward'}</Button>
        <Button disabled={!claimed} onClick={() => { update(s => nextGamingAdventure(s, id)); onNext(); }}>Next Adventure</Button>
      </div>
    </Card>
  </>;
}
