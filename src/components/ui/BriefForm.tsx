'use client';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { services } from '@/content/company';

const timeframes = ['As soon as possible', 'Within a month', 'In 1–3 months', 'Planning stage'];

/**
 * Concept-only form: it validates and confirms, but nothing is sent, stored or tracked.
 */
export function BriefForm({ submitLabel = 'Send brief', className = '' }: { submitLabel?: string; className?: string }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const toggle = (title: string) => setChosen(list => list.includes(title) ? list.filter(item => item !== title) : [...list, title]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setChosen([]);
    setDone(true);
  };
  return (
    <form className={`brief-form ${className}`} onSubmit={submit} onChange={() => setDone(false)}>
      <div className="brief-row">
        <label className="brief-field"><span>Name</span><input name="name" required autoComplete="name" placeholder="Your name" /></label>
        <label className="brief-field"><span>Organisation</span><input name="organisation" autoComplete="organization" placeholder="Company" /></label>
      </div>
      <div className="brief-row">
        <label className="brief-field"><span>Project location</span><input name="location" placeholder="Suburb or corridor" /></label>
        <label className="brief-field"><span>Timeframe</span><select name="timeframe" defaultValue={timeframes[1]}>{timeframes.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      <fieldset className="brief-services">
        <legend>Services needed</legend>
        <div>{services.map(service => {
          const on = chosen.includes(service.title);
          return <button type="button" key={service.id} aria-pressed={on} onClick={() => toggle(service.title)}>{on && <Check size={15} />}{service.title}</button>;
        })}</div>
      </fieldset>
      <label className="brief-field"><span>Message</span><textarea name="message" rows={4} required placeholder="Tell us about the site, scope and deliverables" /></label>
      <button className="brief-submit" type="submit">{submitLabel}<ArrowRight size={20} /></button>
      <p className="brief-note" role="status">{done ? 'Thanks — this is a concept site, so your brief was not sent anywhere.' : 'Concept demo — nothing you type is sent or stored.'}</p>
    </form>
  );
}
