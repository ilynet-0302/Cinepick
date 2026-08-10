import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Award, BarChart3, Clock3, Film, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { getTitlesByKeys } from '../services/tmdb';
import { useLibrary } from '../store/LibraryContext';
import { useAuth } from '../store/AuthContext';

export default function ProfilePage() {
  const library = useLibrary();
  const auth = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  useEffect(() => setDisplayName(auth.profile?.display_name || ''), [auth.profile?.display_name]);
  const { data: watched = [] } = useQuery({ queryKey: ['profile-watched', library.watched], queryFn: () => getTitlesByKeys(library.watched), enabled: library.watched.length > 0 });
  const totalMinutes = watched.reduce((sum, movie) => sum + movie.runtime, 0);
  const ratingValues = Object.values(library.ratings);
  const average = ratingValues.length ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : 0;
  const genreCount = watched.flatMap((movie) => movie.genres).reduce<Record<string, number>>((acc, genre) => ({ ...acc, [genre]: (acc[genre] || 0) + 1 }), {});
  const genreStats = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...genreStats.map(([, value]) => value), 1);
  const genreTotal = Math.max(watched.flatMap((movie) => movie.genres).length, 1);
  const favoriteGenre = genreStats[0]?.[0] || 'Still learning';
  const decades = watched.reduce<Record<string, number>>((acc, movie) => { const decade = `${Math.floor(movie.year / 10) * 10}s`; acc[decade] = (acc[decade] || 0) + 1; return acc; }, {});
  const collection = [{ label: 'Q', value: library.watchlist.length }, { label: 'F', value: library.favorite.length }, { label: 'W', value: library.watched.length }];
  const collectionMax = Math.max(...collection.map((item) => item.value), 1);
  const saveProfile = async (event: FormEvent) => { event.preventDefault(); setAccountMessage(''); try { await auth.updateProfile(displayName); setAccountMessage('Profile saved.'); } catch (error) { setAccountMessage(error instanceof Error ? error.message : 'Could not save profile.'); } };
  const accountName = auth.profile?.display_name || auth.user?.email?.split('@')[0] || 'Guest';

  return <div className="standard-page profile-page page-enter">
    <section className="profile-head"><div className="big-avatar">{accountName.slice(0, 2).toUpperCase()}</div><div><p className="eyebrow">{auth.user ? 'Cloud profile' : 'Guest profile'}</p><h1>Your movie DNA</h1><p>Your taste profile evolves every time you watch, love, and rate a story.</p></div><Link to="/library" className="secondary-btn">View library <ArrowUpRight size={17} /></Link></section>
    <section className="account-panel"><div><span className={`sync-dot ${auth.user ? 'online' : ''}`} /><div><b>{auth.user ? auth.user.email : 'Not signed in'}</b><small>{auth.user ? library.cloudLoading ? 'Synchronizing account…' : 'Library synced with Supabase' : 'Your progress is saved only on this device'}</small></div></div>{auth.user ? <form onSubmit={saveProfile}><input required maxLength={60} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name" /><button className="secondary-btn">Save profile</button><button type="button" className="text-button" onClick={() => auth.signOut()}>Sign out</button></form> : <Link className="primary-btn" to="/auth">Sign in or create account</Link>}{accountMessage && <p>{accountMessage}</p>}</section>
    <div className="stat-grid"><article><span><Film size={20} /></span><div><strong>{watched.length}</strong><small>Titles watched</small></div></article><article><span><Clock3 size={20} /></span><div><strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong><small>Total watch time</small></div></article><article><span><Star size={20} /></span><div><strong>{average.toFixed(1)}</strong><small>Average rating</small></div></article><article><span><Award size={20} /></span><div><strong>{favoriteGenre}</strong><small>Favorite genre</small></div></article></div>
    <div className="dashboard-grid">
      <section className="dashboard-card dna-card"><div className="section-head"><div><p className="eyebrow">Taste breakdown</p><h2>Genre DNA</h2></div><BarChart3 size={20} /></div>{genreStats.length ? <div className="bar-chart">{genreStats.map(([genre, value], index) => <div key={genre}><span>{genre}</span><div><i style={{ width: `${(value / max) * 100}%`, opacity: 1 - index * .12 }} /></div><b>{Math.round((value / genreTotal) * 100)}%</b></div>)}</div> : <p className="muted">Mark titles as watched to build your profile.</p>}</section>
      <section className="dashboard-card decade-card"><div className="section-head"><div><p className="eyebrow">Across the years</p><h2>Favorite eras</h2></div></div><div className="donut" style={{ '--p': `${Math.round(((decades['2020s'] || 0) / Math.max(watched.length, 1)) * 100)}%` } as React.CSSProperties}><div><strong>{Math.round(((decades['2020s'] || 0) / Math.max(watched.length, 1)) * 100)}%</strong><span>2020s</span></div></div><div className="legend"><span><i /> 2020s</span><span><i /> Other eras</span></div></section>
      <section className="dashboard-card directors-card"><div className="section-head"><div><p className="eyebrow">Your creative circle</p><h2>Top directors</h2></div></div>{Object.entries(watched.reduce<Record<string, number>>((acc, movie) => movie.director !== 'Unknown' ? ({ ...acc, [movie.director]: (acc[movie.director] || 0) + 1 }) : acc, {})).sort((a,b) => b[1]-a[1]).slice(0,4).map(([name, count], index) => <div className="director-row" key={name}><span>{index + 1}</span><b>{name}</b><small>{count} {count === 1 ? 'title' : 'titles'}</small></div>)}</section>
      <section className="dashboard-card activity-card"><div className="section-head"><div><p className="eyebrow">At a glance</p><h2>Collection balance</h2></div></div><div className="activity-bars">{collection.map((item) => <div key={item.label}><i style={{ height: `${Math.max((item.value / collectionMax) * 100, 3)}%` }} /><span>{item.label}</span></div>)}</div></section>
    </div>
  </div>;
}
