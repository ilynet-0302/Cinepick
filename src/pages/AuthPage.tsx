import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, KeyRound, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

type Mode = 'signin' | 'signup' | 'reset' | 'recovery';

export default function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'recovery' ? 'recovery' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (auth.recoveryMode) setMode('recovery'); }, [auth.recoveryMode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice(''); setSubmitting(true);
    try {
      if (mode === 'signup') {
        const result = await auth.signUp(email, password, displayName);
        if (result.needsConfirmation) setNotice('Account created. Email confirmation is still enabled in your Supabase dashboard.');
        else navigate('/profile');
      } else if (mode === 'signin') {
        await auth.signIn(email, password); navigate('/profile');
      } else if (mode === 'reset') {
        await auth.sendPasswordReset(email); setNotice('Password reset link sent.');
      } else {
        await auth.updatePassword(password); setNotice('Password updated. You can continue to your profile.');
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Something went wrong.'); }
    finally { setSubmitting(false); }
  };

  if (!auth.configured) return <div className="standard-page empty-state"><h1>Supabase isn’t configured</h1><p>Add the URL and publishable key to `.env`, then restart the app.</p></div>;
  if (auth.user && mode !== 'recovery') return <div className="standard-page auth-page"><section className="auth-card auth-success"><span><CheckCircle2 size={31} /></span><p className="eyebrow">Signed in</p><h1>Welcome back.</h1><p>{auth.user.email}</p><div><Link className="primary-btn" to="/profile">Open profile <ArrowRight size={17} /></Link><button className="secondary-btn" onClick={() => auth.signOut()}>Sign out</button></div></section></div>;

  return <div className="standard-page auth-page page-enter">
    <section className="auth-intro"><Link to="/" className="logo"><span className="logo-mark">C</span><span>cinepick</span></Link><div><p className="eyebrow">Your stories, everywhere</p><h1>{mode === 'signup' ? 'Build your movie DNA.' : mode === 'reset' || mode === 'recovery' ? 'Reset your password.' : 'Welcome back.'}</h1><p>Sync your watchlist, favorites, ratings, and viewing progress securely across devices.</p></div><blockquote>“The more you track, the sharper your recommendations become.”</blockquote></section>
    <section className="auth-form-panel">
      {mode !== 'reset' && mode !== 'recovery' && <div className="auth-tabs"><button className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button></div>}
      <div className="auth-form-head"><span>{mode === 'signup' ? <UserRound /> : mode === 'reset' || mode === 'recovery' ? <KeyRound /> : <LockKeyhole />}</span><h2>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Request a reset link' : mode === 'recovery' ? 'Choose a new password' : 'Sign in to Cinepick'}</h2><p>{mode === 'signup' ? 'No email confirmation required.' : mode === 'signin' ? 'Your saved titles are waiting.' : 'Use a strong password with at least six characters.'}</p></div>
      <form className="auth-form" onSubmit={submit}>
        {mode === 'signup' && <label>Display name<div><UserRound size={17} /><input required maxLength={60} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Movie lover" /></div></label>}
        {mode !== 'recovery' && <label>Email address<div><Mail size={17} /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>}
        {mode !== 'reset' && <label>{mode === 'recovery' ? 'New password' : 'Password'}<div><LockKeyhole size={17} /><input required minLength={6} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></div></label>}
        {error && <p className="form-message error">{error}</p>}{notice && <p className="form-message success">{notice}</p>}
        <button className="primary-btn auth-submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'signin' ? 'Sign in' : mode === 'reset' ? 'Send reset link' : 'Update password'} <ArrowRight size={17} /></button>
      </form>
      {mode === 'signin' && <button className="forgot-link" onClick={() => setMode('reset')}>Forgot your password?</button>}
      {(mode === 'reset' || mode === 'recovery') && <button className="forgot-link" onClick={() => setMode('signin')}>Back to sign in</button>}
    </section>
  </div>;
}
