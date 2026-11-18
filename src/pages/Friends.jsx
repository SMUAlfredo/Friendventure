import React,{useEffect} from 'react';
import {Card,ProgressBar} from '../components/UI';
import {players} from '../data/journey';

export default function Friends({state,onReference}) {
 const contacts=state.completed.includes(8)?players.filter(player=>state.contacts.includes(player.id)):[];
 const progress=Math.round((1+state.completed.filter(id=>id===2||id===3).length)/8*100);
 useEffect(()=>{onReference('Friendventure_LoFi_vs_HTML_HiFi.pdf, page 5')},[onReference]);
 return <><h1>Contacts Made</h1><ProgressBar value={progress}/><Card className="contacts">{contacts.length?contacts.map((player,index)=><div className="contact" key={player.id}><span className="face">{player.face}</span><div><h2>{player.name}</h2><p>Adventure companion</p></div><b>#{String(index+1).padStart(2,'0')}</b></div>):<p>No contacts yet.</p>}</Card></>;
}
