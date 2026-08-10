import { useInfiniteQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { LoadingGrid, MovieCard } from '../components/MovieCard';
import { genreIds, genres } from '../data/genres';
import { discoverTitles, type DiscoverFilters } from '../services/tmdb';
import type { MediaType } from '../types';

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const genreParam = params.get('genre') || '';
  const activeGenre = Object.entries(genreIds).find(([, id]) => String(id) === genreParam)?.[0] || 'All';
  const type = (params.get('type') || 'all') as 'all' | MediaType;
  const minRating = Number(params.get('rating') || 0);
  const year = params.get('year') || 'all';
  const sort = params.get('sort') || 'popularity';
  const language = params.get('language') || 'all';
  const filters: DiscoverFilters = { genre: genreParam || undefined, type, rating: minRating || undefined, year: year === 'all' ? undefined : year, language: language === 'all' ? undefined : language, sort };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['discover', filters], queryFn: ({ pageParam }) => discoverTitles(filters, pageParam), initialPageParam: 1,
    getNextPageParam: (last, pages) => pages.length < last.totalPages ? pages.length + 1 : undefined,
  });
  const titles = data?.pages.flatMap((page) => page.results) || [];
  const setFilter = (key: string, value: string) => { const next = new URLSearchParams(params); if (!value || value === 'all' || value === 'All' || value === '0') next.delete(key); else next.set(key, key === 'genre' ? String(genreIds[value] || value) : value); setParams(next); };
  const reset = () => setParams({});

  return <div className="standard-page page-enter">
    <div className="page-title-row"><div><p className="eyebrow">Find your next story</p><h1>Discover</h1><p>Live films and series from TMDB, tuned to your taste.</p></div><div className="results-count"><strong>{titles.length}</strong><span>loaded titles</span></div></div>
    <div className="discover-layout"><aside className="filters-panel">
      <div className="filter-title"><span><SlidersHorizontal size={18} /> Filters</span><button onClick={reset}>Reset</button></div>
      <label>Type<select value={type} onChange={(e) => setFilter('type', e.target.value)}><option value="all">Movies & TV</option><option value="movie">Movies</option><option value="tv">TV shows</option></select></label>
      <label>Release<select value={year} onChange={(e) => setFilter('year', e.target.value)}><option value="all">Any year</option><option value="2020s">2020 — now</option><option value="2010s">2010 — 2019</option><option value="2024">2024</option><option value="2023">2023</option><option value="2014">2014</option></select></label>
      <label>Language<select value={language} onChange={(e) => setFilter('language', e.target.value)}><option value="all">Any language</option><option value="en">English</option><option value="fr">French</option><option value="ja">Japanese</option><option value="ko">Korean</option></select></label>
      <label>Minimum rating<div className="range-label"><input type="range" min="0" max="9" step="0.5" value={minRating} onChange={(e) => setFilter('rating', e.target.value)} /><b>{minRating ? `${minRating}+` : 'Any'}</b></div></label>
      <label>Sort by<select value={sort} onChange={(e) => setFilter('sort', e.target.value)}><option value="popularity">Most popular</option><option value="rating">Highest rated</option><option value="release">Newest first</option></select></label>
    </aside><div className="discover-results">
      <div className="genre-chips">{genres.map((genre) => <button className={activeGenre === genre ? 'active' : ''} key={genre} onClick={() => setFilter('genre', genre)}>{genre}</button>)}</div>
      {params.toString() && <div className="active-filter-line"><span>Active filters</span><button onClick={reset}>Clear all <X size={14} /></button></div>}
      {isLoading ? <LoadingGrid /> : isError ? <div className="empty-state"><h2>TMDB didn’t respond</h2><p>Check your connection and try again.</p><button className="primary-btn" onClick={() => refetch()}>Try again</button></div> : titles.length ? <><div className="movie-grid">{titles.map((movie) => <MovieCard movie={movie} key={`${movie.type}-${movie.id}`} />)}</div>{hasNextPage && <button className="load-more" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>{isFetchingNextPage ? 'Loading…' : 'Load more titles'}</button>}</> : <div className="empty-state"><span>◎</span><h2>No titles match that mix</h2><p>Try lowering the rating or choosing another genre.</p><button className="primary-btn" onClick={reset}>Reset filters</button></div>}
    </div></div>
  </div>;
}
