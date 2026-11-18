import React,{useState,useEffect} from 'react';
import {Button} from './UI';
export default function GamePuzzle({game,onComplete,snapshot,update}) {
 const [solved,setSolved]=useState(snapshot?.solved||false),[notice,setNotice]=useState(snapshot?.notice||''),[flipped,setFlipped]=useState([]),[matched,setMatched]=useState(snapshot?.matched||[]),[path,setPath]=useState(snapshot?.path||[]);
 useEffect(()=>{update(s=>({...s,game:{...s.game,puzzle:{solved,notice,matched,path}}}))},[solved,notice,matched,path,update]);
 const cards=['🍃','☀️','⛰️','🍃','⛰️','☀️'];
 const configs={
  'Rune Match':{question:'Find the matching rune: ◆',options:['●','◆','▲'],answer:'◆'},
  'Word Trail':{question:'Put these letters in order: A T R I L',options:['TRAIL','TRIAL','TRAIN'],answer:'TRAIL'},
  'Clue Hunt':{question:'I have pages full of stories. What am I?',options:['A book','A boot','A mountain'],answer:'A book'}
 };
 function flip(i){if(flipped.length===2||matched.includes(i)||flipped.includes(i))return;const next=[...flipped,i];setFlipped(next);if(next.length===2){if(cards[next[0]]===cards[next[1]]){const m=[...matched,...next];setMatched(m);setFlipped([]);if(m.length===6)setSolved(true)}else setTimeout(()=>setFlipped([]),700)}}
 return <div className="playing-puzzle">{game==='Memory'?<><p>Find all three pairs.</p><div className="puzzle-grid">{cards.map((v,i)=><button key={i} className="symbol" disabled={matched.includes(i)} aria-label={`Card ${i+1}`} onClick={()=>flip(i)}>{matched.includes(i)||flipped.includes(i)?v:'?'}</button>)}</div></>:game==='Logic Maze'?<><p>Follow the path in order: leaf → mountain → sun.</p><div className="answer-options">{[['sun','☀️'],['leaf','🍃'],['mountain','⛰️']].map(([v,icon])=><button className="symbol" key={v} aria-label={`Path ${v}`} onClick={()=>{const expected=['leaf','mountain','sun'];if(v===expected[path.length]){const next=[...path,v];setPath(next);if(next.length===3)setSolved(true)}else{setPath([]);setNotice('Start again at the leaf.')}}}>{icon}</button>)}</div><p>Path: {path.length} of 3</p></>:<><p>{configs[game]?.question}</p><div className="puzzle-choices">{configs[game]?.options.map(option=><Button secondary key={option} onClick={()=>{if(option===configs[game].answer){setSolved(true);setNotice('Correct!')}else setNotice('Try again.')}}>{option}</Button>)}</div></>}{notice&&<p role="status">{notice}</p>}<Button disabled={!solved} onClick={onComplete}>Continue Quest →</Button></div>
}
