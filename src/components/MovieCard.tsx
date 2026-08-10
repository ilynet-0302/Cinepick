import { Bookmark, Check, Heart, ImageOff, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLibrary } from '../store/LibraryContext';
import type { Movie } from '../types';

export function MovieCard({ movie, rank, compact = false }: { movie: Movie; rank?: number; compact?: boolean }) {
  const library = useLibrary();
  const [imageError, setImageError] = useState(false);
  return <article className={`movie-card ${compact ? 'compact' : ''}`}>
    {rank && <span className="rank">{String(rank).padStart(2, '0')}</span>}
    <Link to={`/${movie.type}/${movie.id}`} className="poster-wrap" aria-label={`View ${movie.title}`}>
      {movie.poster && !imageError ? <img src={movie.poster} alt={`${movie.title} poster`} loading="lazy" onError={() => setImageError(true)} /> : <div className="poster-fallback"><ImageOff size={30} /><span>{movie.title}</span></div>}
      <span className="rating-pill"><Star size={13} fill="currentColor" /> {movie.rating.toFixed(1)}</span>
      <div className="card-overlay"><p>{movie.overview}</p><span>View details</span></div>
    </Link>
    <div className="card-info">
      <div className="card-heading"><Link to={`/${movie.type}/${movie.id}`}>{movie.title}</Link><span>{movie.year}</span></div>
      <p className="genre-line">{movie.genres.slice(0, 2).join(' · ')}</p>
      <div className="quick-actions">
        <button className={library.inList('favorite', movie) ? 'selected' : ''} onClick={() => library.toggle('favorite', movie)} title="Favorite" aria-label="Toggle favorite"><Heart size={17} fill={library.inList('favorite', movie) ? 'currentColor' : 'none'} /></button>
        <button className={library.inList('watchlist', movie) ? 'selected' : ''} onClick={() => library.toggle('watchlist', movie)} title="Watchlist" aria-label="Toggle watchlist"><Bookmark size={17} fill={library.inList('watchlist', movie) ? 'currentColor' : 'none'} /></button>
        <button className={library.inList('watched', movie) ? 'selected watched' : ''} onClick={() => library.toggle('watched', movie)} title="Mark as watched" aria-label="Toggle watched"><Check size={18} /></button>
      </div>
    </div>
  </article>;
}

export function MovieRow({ title, kicker, items, numbered = false }: { title: string; kicker?: string; items: Movie[]; numbered?: boolean }) {
  return <section className="content-section">
    <div className="section-head"><div>{kicker && <p className="eyebrow">{kicker}</p>}<h2>{title}</h2></div><Link to="/discover" className="text-link">Explore all <span>→</span></Link></div>
    <div className={`horizontal-grid ${numbered ? 'numbered' : ''}`}>{items.map((movie, index) => <MovieCard key={movie.id} movie={movie} rank={numbered ? index + 1 : undefined} />)}</div>
  </section>;
}

export function LoadingGrid() {
  return <div className="movie-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" key={index}><div /><span /><small /></div>)}</div>;
}
