import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { AUTH } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

export function Signup() {
  const { signUp, session, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const data = await signUp(email, password, fullName);
      if (data?.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setInfo(AUTH.CHECK_EMAIL);
      }
    } catch (err) {
      setError(err.message || ERR.SIGNUP_FAILED);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title={AUTH.SIGNUP_TITLE} crumbs={[{ label: AUTH.SIGNUP_CRUMB, active: true }]} />
      <div className="container mx-auto max-w-md px-4 py-12">
        <form className="card border border-base-300 bg-base-100 shadow-xl" onSubmit={onSubmit}>
          <div className="card-body gap-4">
            <h2 className="card-title font-display justify-center text-2xl">{AUTH.CREATE_ACCOUNT}</h2>
            {error ? (
              <div role="alert" className="alert alert-error text-sm">
                {error}
              </div>
            ) : null}
            {info ? (
              <div role="alert" className="alert alert-success text-sm">
                {info}
              </div>
            ) : null}
            <label className="form-control w-full">
              <span className="label-text">{AUTH.FULL_NAME}</span>
              <input type="text" className="input input-bordered w-full" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="form-control w-full">
              <span className="label-text">{COMMON.EMAIL}</span>
              <input type="email" className="input input-bordered w-full" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="form-control w-full">
              <span className="label-text">{COMMON.PASSWORD}</span>
              <input
                type="password"
                className="input input-bordered w-full"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? <span className="loading loading-spinner" /> : null}
              {submitting ? COMMON.PLEASE_WAIT : AUTH.SIGNUP_TITLE}
            </button>
            <p className="text-center text-sm text-base-content/70">
              {AUTH.HAS_ACCOUNT}{' '}
              <Link to="/login" className="link link-primary font-medium">
                {AUTH.LOGIN_TITLE}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
