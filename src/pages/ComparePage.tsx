import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Check, Search, Star, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getTitleDetails, getTrending } from '../services/tmdb';
import { mediaKey, parseMediaKey } from '../utils/mediaKey';
import type { Movie } from '../types';

export default function ComparePage() {
  const [params, setParams] = useSearchParams();
  const { data: trending = [], isLoading } = useQuery({ queryKey: ['compare-options'], queryFn: getTrending });
  const options = trending.filter((movie) => movie.type === 'movie').slice(0, 20);
  const selectedA = parseMediaKey(params.get('a') || '') || (options[0] ? { type: options[0].type, id: options[0].id } : null);
  const firstDifferent = options.find((movie) => !selectedA || movie.id !== selectedA.id);
  const selectedB = parseMediaKey(params.get('b') || '') || (firstDifferent ? { type: firstDifferent.type, id: firstDifferent.id } : null);
  const { data: a } = useQuery({ queryKey: ['compare-title', selectedA], queryFn: () => getTitleDetails(selectedA!.id, selectedA!.type), enabled: Boolean(selectedA) });
  const { data: b } = useQuery({ queryKey: ['compare-title', selectedB], queryFn: () => getTitleDetails(selectedB!.id, selectedB!.type), enabled: Boolean(selectedB) });
  const update = (key: 'a' | 'b', value: string) => { const next = new URLSearchParams(params); next.set(key, value); setParams(next); };

  if (isLoading || !a || !b) return <div className="standard-page empty-state"><span>↔</span><h2>Loading live comparisons…</h2></div>;
  const left = a as Movie;
  const right = b as Movie;
  const rows = [['Rating', left.rating, right.rating, 'rating'], ['Runtime', `${left.runtime} min`, `${right.runtime} min`, 'runtime'], ['Release', left.year, right.year, 'year'], ['Genres', left.genres.join(', '), right.genres.join(', '), ''], ['Director', left.director, right.director, ''], ['Popularity', Math.round(left.popularity), Math.round(right.popularity), 'popularity'], ['Budget', `$${Math.round((left.budget || 0) / 1_000_000)}M`, `$${Math.round((right.budget || 0) / 1_000_000)}M`, 'budget'], ['Revenue', `$${Math.round((left.revenue || 0) / 1_000_000)}M`, `$${Math.round((right.revenue || 0) / 1_000_000)}M`, 'revenue']];
  const numeric = (movie: Movie, key: string) => key === 'rating' ? movie.rating : key === 'runtime' ? movie.runtime : key === 'year' ? movie.year : key === 'popularity' ? movie.popularity : key === 'budget' ? movie.budget || 0 : key === 'revenue' ? movie.revenue || 0 : 0;
  const better = (key: string) => !key ? '' : numeric(left, key) > numeric(right, key) ? 'a' : numeric(right, key) > numeric(left, key) ? 'b' : '';

  return <div className="standard-page compare-page page-enter"><div className="page-title-row"><div><p className="eyebrow">Side by side</p><h1>Compare movies</h1><p>Live metadata for current trending titles.</p></div><span className="compare-icon"><ArrowLeftRight size={26} /></span></div>
    <div className="compare-selectors">{([['a', left], ['b', right]] as const).map(([key, movie], index) => <div className="movie-selector" key={key}><span>{index ? 'Challenger' : 'First pick'}</span><div><Search size={17} /><select value={mediaKey(movie)} onChange={(e) => update(key, e.target.value)}>{options.map((option) => <option value={mediaKey(option)} key={mediaKey(option)}>{option.title}</option>)}</select></div></div>)}<span className="versus">VS</span></div>
    <section className="comparison-table"><div className="compare-movie blank" />{[left,right].map((movie) => <div className="compare-movie" key={mediaKey(movie)}><img src={movie.poster} alt="" /><div><h2>{movie.title}</h2><p>{movie.year} · {movie.genres[0]}</p><span><Star size={14} fill="currentColor" /> {movie.rating}</span></div></div>)}{rows.map(([label, av, bv, key]) => { const winner = better(String(key)); return <div className="compare-row" key={String(label)}><b>{label}</b><span className={winner === 'a' ? 'winner' : ''}>{av}{winner === 'a' && <Check size={14} />}</span><span className={winner === 'b' ? 'winner' : ''}>{bv}{winner === 'b' && <Check size={14} />}</span></div>; })}</section>
    <div className="compare-verdict"><span>{left.rating === right.rating ? <X /> : <Star fill="currentColor" />}</span><div><p className="eyebrow">The verdict</p><h2>{left.rating >= right.rating ? left.title : right.title} has the edge</h2><p>Based on current TMDB audience rating and popularity.</p></div></div>
  </div>;
}
