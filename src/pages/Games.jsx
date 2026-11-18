import React,{useEffect,useState} from 'react';
import {Button,Card,ProgressBar} from '../components/UI';
import {games} from '../data/catalog';
import {players,matchPlayers,reviewPlayers} from '../data/journey';
import Completion from './Completion';
const symbols=['🍃','⛰️','☀️'];
const game='Pattern Path';
export default function Games({state,update,onComplete,navigate,onReference}) {
 const savedGame=state.game;
 const canResume=savedGame?.name===game || savedGame?.stage==='reward';
 const savedStage=canResume? savedGame.stage : 'choose';
 const localReplayEnd=savedGame?.mode==='local' && savedStage==='done';
 const initialStage=localReplayEnd?'choose':savedStage==='positive'?'done':savedStage==='negative'?'additional':savedStage||'choose';
 const [mode,setMode]=useState(state.game?.mode||'local'),[stage,setStage]=useState(initialStage),[reaction,setReaction]=useState(state.game?.reaction??null),[notice,setNotice]=useState(state.game?.notice??''),[answer,setAnswer]=useState(state.game?.answer??null),[written,setWritten]=useState(state.game?.written??''),[enjoyed,setEnjoyed]=useState(state.game?.enjoyed??null);
 const [matched,setMatched]=useState(state.game?.players||[]);
 const companion=players.find(p=>p.id===matched[0]);
 const shared=companion?.hobbies.filter(h=>state.hobbies.includes(h))||[];
 useEffect(()=>{update(s=>({...s,game:{...s.game,mode,name:game,stage,players:matched,reaction,notice,answer,written,enjoyed}}))},[mode,stage,matched,reaction,notice,answer,written,enjoyed,update]);
 const online=state.completed.includes(2);
 useEffect(()=>{if(stage!=='playing'||mode!=='online')return;const timer=setTimeout(()=>setNotice(`${companion?.name||'Companion'} sent you a happy reaction 🙂`),2200);return()=>clearTimeout(timer)},[stage,mode,companion?.name]);
 useEffect(()=>{
  let screen = null;
  if(stage==='reward')screen=mode==='local'?'4.1':'17.1';
  else if(stage==='choose')screen=online?'7':'3';
  else if(stage==='playing')screen=mode==='local'?'4':(reaction===2||reaction===4)?'10':(notice.includes('sent you')||notice.includes('shared with'))?'9':'8';
  else screen=({question:'11',additional:'15',written:'16',done:enjoyed===true?'13':'17'})[stage];
  const pages={'3':26,'4':27,'4.1':28,'7':32,'8':33,'9':34,'10':35,'11':36,'12':37,'13':38,'14':39,'15':40,'16':41,'17':42,'17.1':43};
  onReference(screen?`Final UX scenarios — Scenario 2, Screen ${screen} (PDF page ${pages[screen]})`:null);
 },[stage,online,mode,reaction,notice,enjoyed,onReference]);
 const start=()=>{const ids=mode==='online'?matchPlayers(state,1):[];setMatched(ids);update(s=>({...s,game:{mode,name:game,players:ids,stage:'playing'}}));setAnswer(null);setReaction(null);setNotice('');setEnjoyed(null);setWritten('');setStage('playing')};
 const complete=()=>{onComplete(mode);if(mode==='local'&&state.completed.includes(2)){setStage('choose');return}setStage(mode==='online'?'question':'reward')};
 const sendReaction=(i)=>{setReaction(i);update(s=>{const next=i===0||i===2||i===4?reviewPlayers(s,matched,i===0):s;return {...next,reactions:[...next.reactions,{reaction:i,shared:i===0,players:matched}]}});setNotice(i===0?'Your happy reaction was shared with '+companion?.name+'.':i===1||i===3?'Neutral reaction recorded.':'Saved privately to help with future matching.')};
 const enjoy=(value)=>{
  setEnjoyed(value);
  update(s=>({...reviewPlayers(s,matched,value),feedback:[...s.feedback,{game,mode,enjoyed:value,players:matched,text:''}]}));
  setStage(value?'done':'additional');
 };
 const sendWritten=()=>{update(s=>({...s,feedback:s.feedback.map((f,i)=>i===s.feedback.length-1?{...f,text:written}:f)}));setStage('done')};
 const exit=()=>{const id=mode==='local'?2:3;if(state.pendingGameRewards.includes(id)){setStage('reward')}else{update(s=>({...s,game:{...s.game,stage:'choose'}}));setStage('choose');navigate('progress')}};
 if(stage==='reward')return <Completion state={state} update={update} id={mode==='local'?2:3} onNext={()=>{setStage('choose');navigate('progress')}}/>;
 if(stage==='choose')return <><h1>Games / Puzzles</h1><ProgressBar value={online?38:25}/><div className="game-categories">{['local','online'].map(m=><button key={m} className={`category ${mode===m?'selected':''}`} disabled={m==='online'&&!online} onClick={()=>setMode(m)}><span>{m==='local'?'🧩':online?'🎮':'🔒'}</span><strong>{m==='online'&&!online?'???':<>{m==='local'?'Local':'Online'} Games<br/>/ Puzzles</>}</strong></button>)}</div><p className="category-help">{mode==='local'?'Individual games for practice.':`Play with another student who shares your interests.`}</p><Card className="game-grid">{games.map(g=><button className={`chip ${game===g?'selected':''}`} key={g} disabled={g!==game}>{g}</button>)}</Card><Card className="game-preview"><h2>{game}</h2><p>Select the missing symbol.</p><div className="symbol-row">{['🍃','⛰️','🍃','?'].map((s,i)=><span className="symbol" key={i}>{s}</span>)}</div><Button onClick={start}>Play Game →</Button></Card></>;
 return <><div className="game-window"><div className="game-controls"><button aria-label="Game settings" disabled><span aria-hidden="true">⚙</span></button><button aria-label="Exit game" onClick={()=>setStage(state.pendingGameRewards.includes(mode==='local'?2:3)?'reward':'choose')}>×</button></div>{stage==='playing'?<><h1>{mode==='local'?'Local':'Online'} Game</h1><h2 className="center">{game}</h2>{mode==='online'&&<p className="matching">Playing with {companion?.name} (simulated) · {shared.length?'Shared interest: '+shared[0]:'Enjoys '+companion?.hobbies[0]}</p>}<div className="playing-puzzle"><p>Find the missing symbol.</p><div className="puzzle-grid">{['🍃','⛰️','☀️','⛰️','☀️','🍃','☀️','🍃',answer===1?'⛰️':'?'].map((s,i)=><span className={`symbol ${i===8?'missing':''}`} key={i}>{s}</span>)}</div><div className="answer-options">{symbols.map((s,i)=><button aria-label={`Choose ${['leaf','mountain','sun'][i]}`} className={`symbol ${answer===i?'selected':''}`} key={s} onClick={()=>{setAnswer(i);if(i===1)setNotice('That’s right! The pattern is complete.');else setNotice('Try another symbol. Look at each row.')}}>{s}</button>)}</div><Button disabled={answer!==1} onClick={complete}>Continue Quest →</Button></div>{notice&&<p className="game-notice" role="status">{notice}</p>}{mode==='online'&&<div className="reactions" aria-label="Player reactions">{['🙂','😐','😠','😮','😕'].map((r,i)=><button key={r} className={`${reaction===i?'selected':''} ${reaction===i&&(i===2||i===4)?'negative':''}`} aria-label={['Happy reaction','Neutral reaction','Angry reaction','Surprised reaction','Unhappy reaction'][i]} aria-pressed={reaction===i} onClick={()=>sendReaction(i)}>{r}</button>)}</div>}</>:<><h1 className="game-over">Game Over</h1><Card className={`feedback ${stage==='done'||stage==='question'||stage==='additional'?'feedback-terminal':''}`}>{stage==='question'?<><h2 className="thank-you-message"><span>Did you enjoy the game?</span></h2><div className="feedback-choices end-actions"><Button className="yes" onClick={()=>enjoy(true)}>Yes</Button><Button className="no" onClick={()=>enjoy(false)}>No</Button></div></>:stage==='additional'?<><h2 className="thank-you-message"><span>Thank you for your feedback</span></h2><section className="feedback-follow-up"><p>Anything you would like to share with us?</p><div className="feedback-choices"><Button onClick={()=>setStage('written')}>Yes</Button><Button secondary onClick={()=>setStage('done')}>No</Button></div></section></>:stage==='written'?<><label className="field">Tell us what happened<textarea value={written} onChange={e=>setWritten(e.target.value)} placeholder="Your feedback…"/></label><div className="actions"><Button onClick={sendWritten}>Send</Button></div></>:<><h2 className="thank-you-message"><span>Thank you for your feedback</span></h2><div className="end-actions"><Button onClick={start}><span className="end-action-icon" aria-hidden="true">↻</span><span>Replay</span></Button><Button secondary onClick={exit}><span className="end-action-icon" aria-hidden="true">×</span><span>Exit</span></Button></div></>}</Card></>}</div></>
}
