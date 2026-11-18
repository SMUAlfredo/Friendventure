import React, {useEffect, useRef, useState} from 'react';
import {Button, Card} from '../components/UI';
import Confirmation from '../components/Confirmation';
import {hobbies} from '../data/catalog';
import {profileFields, validateProfile, deleteHobbies} from '../data/profile';

export default function Onboarding({page, state, update, navigate, finish, editProfile, saveProfile, continueProfile, back, onReference, welcome}) {
  const [draft, setDraft] = useState({...state.profile});
  const [errors, setErrors] = useState({});
  const [profileStage, setProfileStage] = useState('form');
  const [selecting, setSelecting] = useState(false);
  const [marked, setMarked] = useState([]);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const form = useRef(null);

  useEffect(() => {
    let screen;
    if (page === 'profile') screen = profileStage === 'confirm' ? 3 : profileStage === 'saved' ? 4 : Object.keys(errors).length ? 2 : 1;
    else if (page === 'preferences-saved') screen = 16;
    else if (page === 'preferences') screen = open ? 6 : state.onboarded ? 14 : 5;
    else screen = confirmDelete ? 12 : detail ? 8 : selecting ? 9 : 7;
    onReference(`Final UX scenarios — Scenario 1, Screen ${screen} (PDF page ${screen + 1})`);
  }, [page, profileStage, errors, open, state.onboarded, confirmDelete, detail, selecting, onReference]);

  function submitProfile(e) {
    e.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      form.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
    } else setProfileStage('confirm');
  }

  function confirmProfile() {
    const cleaned = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, String(value).trim()]));
    saveProfile(cleaned);
    setDraft(cleaned);
    setProfileStage('saved');
  }

  const toggle = h => update(s => ({...s, hobbies: s.hobbies.includes(h) ? s.hobbies.filter(x => x !== h) : [...s.hobbies, h]}));
  function removeSelected() {
    update(s => deleteHobbies(s, marked));
    setConfirmDelete(false);
    setMarked([]);
    setSelecting(false);
  }

  return <>
    {page === 'profile' && profileStage === 'confirm' ? <Card className="profile-save">
      <Confirmation title="Do you want to save changes?" onCancel={() => setProfileStage('form')} onConfirm={confirmProfile}/>
      <div className="actions"><Button disabled>Preferences</Button></div>
    </Card> : page === 'profile' ? <>
      <h1>Create Profile Before Start</h1>
      <Card>
        <h2>Personal Information</h2>
        <form ref={form} noValidate onSubmit={submitProfile}>
          {profileFields.map(([key, label, type]) => <div className="field" key={key}>
            <label htmlFor={`profile-${key}`}>{label}</label>
            <input id={`profile-${key}`} name={key} type={type} min={key === 'age' ? 1 : undefined} step={key === 'age' ? 1 : undefined}
              required readOnly={profileStage === 'saved'} value={draft[key]} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined}
              onChange={e => {
                const next = {...draft, [key]: e.target.value}; setDraft(next);
                if (errors[key]) setErrors(previous => { const remaining = {...previous}; const message = validateProfile(next)[key]; if (message) remaining[key] = message; else delete remaining[key]; return remaining; });
              }} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : 'off'}/>
            {errors[key] && <span id={`error-${key}`} className="field-error">{errors[key]}</span>}
          </div>)}
          {Object.keys(errors).length > 0 && <p className="form-error" role="alert">Some fields are incorrect or incomplete. Please correct the highlighted fields before continuing.</p>}
          {profileStage === 'saved' && <p className="save-status" role="status">Information saved!</p>}
          <div className="actions">
            {state.onboarded && profileStage !== 'saved' && <Button type="button" secondary onClick={back}>Back</Button>}
            {profileStage === 'saved' ? <Button type="button" onClick={continueProfile}>Preferences</Button> : <Button type="submit">Confirm</Button>}
          </div>
        </form>
      </Card>
    </> : page === 'preferences-saved' ? <>
      <Card className="preferences-saved">
        <h1>Preferences saved!</h1>
        <div role="status"><h2>{welcome ? 'Welcome to Friendventure' : 'Your preferences are up to date'}</h2>
          <p>{welcome ? 'Go ahead to check out your welcome avatar items and enjoy your journey with us!' : 'Your interests have been saved. Continue your journey from Avatar.'}</p>
        </div>
        <div className="actions"><Button onClick={() => navigate('avatar')}>Avatar</Button></div>
      </Card>
    </> : page === 'preferences' ? <>
      <h1>Preferences</h1>
      <Card>
        <div className="toolbar"><Button secondary className="edit-personal-info" onClick={editProfile}>Edit Personal Info</Button></div>
        <div className="hobby-picker" onKeyDown={e => {
          if (e.key === 'Escape' && open) {
            setOpen(false);
            e.currentTarget.querySelector('.dropdown').focus();
          }
        }}>
        <button className="dropdown" aria-expanded={open} aria-controls="hobby-options" onClick={() => setOpen(!open)}>Dropdown list of hobbies <span>{open ? '▴' : '▾'}</span></button>
        <div className="hobby-picker-content">
        {open && <div className="hobby-dropdown" id="hobby-options" role="group" aria-label="Hobbies">
          <input aria-label="Search hobbies" placeholder="Search hobbies…" value={search} onChange={e => setSearch(e.target.value)}/>
          <div>{hobbies.filter(h => h.toLowerCase().includes(search.toLowerCase())).map(h => <button key={h} aria-pressed={state.hobbies.includes(h)} onClick={() => toggle(h)}>{h}<span>{state.hobbies.includes(h) ? '✓' : '+'}</span></button>)}</div>
        </div>}
        <div inert={open}>
        <h2>Most popular hobbies</h2>
        <div className="hobby-grid">{hobbies.slice(0, 6).map(h => <button className={`chip ${state.hobbies.includes(h) ? 'selected' : ''}`} key={h} onClick={() => toggle(h)} aria-pressed={state.hobbies.includes(h)}>{h}</button>)}</div>
        <h2>Hobbies selected</h2>
        <div className="selected-hobbies hobby-grid">{state.hobbies.length ? state.hobbies.map(h => <button className="chip selected" key={h} onClick={() => toggle(h)} aria-label={`Remove ${h}`}>{h} ×</button>) : <p className="muted">Choose your interests above.</p>}</div>
        </div>
        </div>
        </div>
      </Card>
      <div className="actions"><Button secondary onClick={back}>Back</Button><Button disabled={!state.hobbies.length} onClick={() => navigate('review')}>Confirm</Button></div>
    </> : <>
      <h1>Review Preferences</h1>
      {confirmDelete ? <Confirmation title="Do you want to delete these hobbies?" onCancel={() => setConfirmDelete(false)} onConfirm={removeSelected}>
        <ul className="delete-list">{marked.map(h => <li key={h}>{h}</li>)}</ul>
      </Confirmation> : <>
        <Card>
          <div className="review-header"><h2>Your list</h2>
          <div className="review-controls">
          <div className="toolbar review-toolbar">
            <Button secondary className="select-hobbies" aria-pressed={selecting} onClick={() => { setSelecting(!selecting); setMarked([]); setDetail(null); }}>{selecting ? 'Unselect' : 'Select'}</Button>
            <Button secondary className="delete-hobbies" disabled={!marked.length} onClick={() => setConfirmDelete(true)}>Delete</Button>
            <Button secondary className="add-hobbies" onClick={() => navigate('preferences')}>Add</Button>
          </div>
          <div className="toolbar review-profile-toolbar"><Button secondary className="edit-personal-info" onClick={editProfile}>Edit Personal Info</Button></div>
          </div>
          </div>
          <div className="hobby-grid review-hobbies">{state.hobbies.map(h => <button className={`chip ${marked.includes(h) ? 'marked' : ''} ${detail === h ? 'selected' : ''}`} aria-pressed={selecting ? marked.includes(h) : detail === h}
            onClick={() => selecting ? setMarked(marked.includes(h) ? marked.filter(x => x !== h) : [...marked, h]) : setDetail(detail === h ? null : h)} key={h}>
            {selecting && <span>{marked.includes(h) ? '☑' : '☐'} </span>}{h}
          </button>)}</div>
          {!state.hobbies.length && <p className="muted">Add hobbies to personalize your adventure.</p>}
          {detail && <label className="field details">Add details · {detail}<textarea placeholder="Tell us more about this interest…" value={state.details[detail] || ''} onChange={e => update(s => ({...s, details: {...s.details, [detail]: e.target.value}}))}/></label>}
        </Card>
        <div className="actions"><Button secondary onClick={back}>Back</Button><Button disabled={!state.hobbies.length} onClick={() => { if (detail) setDetail(null); else finish(); }}>Confirm</Button></div>
      </>}
    </>}
  </>;
}
