import { Bookmark, CalendarDays, Check, ChevronLeft, Clock3, Heart, Play, Share2, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MovieRow } from '../components/MovieCard';
import { getRelatedTitles, getTitleDetails } from '../services/tmdb';
import { useLibrary } from '../store/LibraryContext';
import { mediaKey } from '../utils/mediaKey';
import type { MediaType } from '../types';

export default function MoviePage() {
  const { id } = useParams();
  const location = useLocation();
  const type: MediaType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';
  const { data: movie, isLoading } = useQuery({ queryKey: ['title', type, id], queryFn: () => getTitleDetails(Number(id), type), enabled: Boolean(id) });
  const { data: similar = [] } = useQuery({ queryKey: ['related', type, id], queryFn: () => getRelatedTitles(Number(id), type), enabled: Boolean(id) });
  const library = useLibrary();
  const navigate = useNavigate();
  if (isLoading) return <div className="standard-page empty-state"><span>◌</span><h2>Setting the scene…</h2><p>Loading title details from TMDB.</p></div>;
  if (!movie) return <div className="standard-page empty-state"><span>404</span><h1>That title left the theater</h1><p>We couldn’t find this movie in the catalog.</p><Link className="primary-btn" to="/discover">Browse movies</Link></div>;

  return <div className="detail-page page-enter">
    <section className="detail-hero" style={{ '--detail-bg': `url(${movie.backdrop})` } as React.CSSProperties}>
      <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={18} /> Back</button>
      <div className="detail-content">
        <img className="detail-poster" src={movie.poster} alt={`${movie.title} poster`} />
        <div className="detail-copy">
          <div className="hero-badges"><span className="badge accent">{movie.type === 'movie' ? 'Movie' : 'Series'}</span><span className="badge"><Star size={13} fill="currentColor" /> {movie.rating}</span></div>
          <h1>{movie.title}</h1>{movie.originalTitle !== movie.title && <p className="original-title">{movie.originalTitle}</p>}
          <div className="detail-meta"><span><CalendarDays size={16} /> {movie.year}</span><span><Clock3 size={16} /> {movie.runtime} min</span><span>{movie.genres.join(' · ')}</span></div>
          <p className="detail-overview">{movie.overview}</p>
          <p className="director-line"><span>Directed by</span> {movie.director}</p>
          <div className="detail-actions"><a className="primary-btn" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} official trailer`)}`} target="_blank" rel="noreferrer"><Play size={17} fill="currentColor" /> Watch trailer</a><button className={library.inList('watchlist', movie) ? 'round-action active' : 'round-action'} onClick={() => library.toggle('watchlist', movie)}><Bookmark size={19} fill={library.inList('watchlist', movie) ? 'currentColor' : 'none'} /></button><button className={library.inList('favorite', movie) ? 'round-action active' : 'round-action'} onClick={() => library.toggle('favorite', movie)}><Heart size={19} fill={library.inList('favorite', movie) ? 'currentColor' : 'none'} /></button><button className="round-action" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 size={19} /></button></div>
        </div>
      </div>
    </section>

    <div className="detail-body">
      <section className="detail-main">
        <div className="rating-box"><div><span>Audience score</span><strong>{Math.round(movie.rating * 10)}%</strong><small>{movie.voteCount.toLocaleString()} ratings</small></div><div className="rating-stars"><p>Your rating</p>{[2,4,6,8,10].map((n) => <button onClick={() => library.rate(movie, n)} className={(library.ratings[mediaKey(movie)] || 0) >= n ? 'filled' : ''} key={n}><Star size={22} fill="currentColor" /></button>)}</div></div>
        <section className="cast-section"><div className="section-head"><div><p className="eyebrow">Faces of the story</p><h2>Top cast</h2></div></div>{movie.cast.length ? <div className="cast-row">{movie.cast.map((person) => <Link to={`/person/${person.id}`} key={person.id} className="cast-card"><img src={person.photo} alt={person.name} /><span><b>{person.name}</b><small>{person.role}</small></span></Link>)}</div> : <p className="muted">Full cast information is available when connected to TMDB.</p>}</section>
      </section>
      <aside className="facts-panel"><h3>Details</h3><dl><div><dt>Status</dt><dd>Released</dd></div><div><dt>Original language</dt><dd>{movie.language.toUpperCase()}</dd></div><div><dt>Country</dt><dd>{movie.country}</dd></div><div><dt>Studio</dt><dd>{movie.studio}</dd></div><div><dt>Budget</dt><dd>${Math.round((movie.budget || 0) / 1_000_000)}M</dd></div><div><dt>Revenue</dt><dd>${Math.round((movie.revenue || 0) / 1_000_000)}M</dd></div></dl><div className="progress-control"><label><span>Viewing progress</span><b>{library.progress[mediaKey(movie)] || 0}%</b></label><input type="range" min="0" max="100" step="5" value={library.progress[mediaKey(movie)] || 0} onChange={(event) => library.setProgress(movie, Number(event.target.value))} /><small>{library.cloudLoading ? 'Syncing…' : 'Move the slider to track progress'}</small></div><button className={library.inList('watched', movie) ? 'watched-button active' : 'watched-button'} onClick={() => library.toggle('watched', movie)}><Check size={18} /> {library.inList('watched', movie) ? 'Watched' : 'Mark as watched'}</button><Link to={`/compare?a=${mediaKey(movie)}`} className="compare-link">Compare this title →</Link></aside>
    </div>
    {similar.length > 0 && <div className="detail-similar"><MovieRow title="You may also like" kicker="More stories like this" items={similar} /></div>}
  </div>;
}
