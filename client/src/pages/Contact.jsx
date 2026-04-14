import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../lib/api';
import { CONTACT_PAGE } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('');
    setSending(true);
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, subject, message }),
      });
      setStatus(CONTACT_PAGE.SENT_OK);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setStatus(err.data?.error || err.message || ERR.SEND_FAILED);
    } finally {
      setSending(false);
    }
  }

  const sentOk = status === CONTACT_PAGE.SENT_OK;

  return (
    <>
      <PageHeader title={CONTACT_PAGE.TITLE} crumbs={[{ label: CONTACT_PAGE.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-center text-3xl font-bold">{CONTACT_PAGE.H2}</h2>
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-semibold">{CONTACT_PAGE.H3}</h3>
            <p className="mt-3 text-base-content/80">{CONTACT_PAGE.INTRO}</p>
            <ul className="mt-8 space-y-4">
              <li className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-content">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{CONTACT_PAGE.OFFICE}</p>
                  <p className="text-sm text-base-content/70">{CONTACT_PAGE.OFFICE_ADDR}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-content">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{CONTACT_PAGE.MOBILE}</p>
                  <p className="text-sm text-base-content/70">+91 8683045908</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-content">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{COMMON.EMAIL}</p>
                  <p className="text-sm text-base-content/70">secretcoder@gmail.com</p>
                </div>
              </li>
            </ul>
          </div>
          <form className="card border border-base-300 bg-base-100 shadow-lg" onSubmit={onSubmit}>
            <div className="card-body gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control w-full">
                  <span className="label-text">{CONTACT_PAGE.YOUR_NAME}</span>
                  <input type="text" className="input input-bordered w-full" required value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="form-control w-full">
                  <span className="label-text">{COMMON.EMAIL}</span>
                  <input type="email" className="input input-bordered w-full" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
              </div>
              <label className="form-control w-full">
                <span className="label-text">{CONTACT_PAGE.SUBJECT}</span>
                <input type="text" className="input input-bordered w-full" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </label>
              <label className="form-control w-full">
                <span className="label-text">{CONTACT_PAGE.MESSAGE}</span>
                <textarea className="textarea textarea-bordered h-36 w-full" required value={message} onChange={(e) => setMessage(e.target.value)} />
              </label>
              {status ? (
                <div role="alert" className={sentOk ? 'alert alert-success' : 'alert alert-error'}>
                  {status}
                </div>
              ) : null}
              <button type="submit" className="btn btn-primary w-full" disabled={sending}>
                {sending ? <span className="loading loading-spinner" /> : null}
                {sending ? CONTACT_PAGE.SENDING : CONTACT_PAGE.SEND}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
