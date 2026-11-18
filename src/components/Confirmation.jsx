import React, {useEffect, useRef} from 'react';
import {Button, Card} from './UI';

// An inline dialog keeps the external Reset Demo available and follows the sketch's card layout.
export default function Confirmation({title, children, onCancel, onConfirm}) {
  const cancel = useRef(null);
  useEffect(() => { cancel.current?.focus(); }, []);
  return <Card className="confirmation" role="dialog" aria-label={title} onKeyDown={e => {
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
  }}>
    <h2>{title}</h2>
    {children}
    <div className="actions">
      <button ref={cancel} className="button secondary" onClick={onCancel}>Cancel</button>
      <Button onClick={onConfirm}>Confirm</Button>
    </div>
  </Card>;
}
