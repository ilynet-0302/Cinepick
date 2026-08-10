import { useQuery } from '@tanstack/react-query';
import { Clock3, Search, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LoadingGrid, MovieCard } from '../components/MovieCard';
import { useDebounce } from '../hooks/useDebounce';
import { searchPeople, searchTitles } from '../services/tmdb';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('cinepick-searches') || '[]'));
  const debounced = useDebounce(query);
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['search', debounced], queryFn: () => searchTitles(debounced), enabled: Boolean(debounced.trim()) });
  const { data: people = [] } = useQuery({ queryKey: ['people-search', debounced], queryFn: () => searchPeople(debounced), enabled: Boolean(debounced.trim()) });

  useEffect(() => {
    if (!debounced.trim()) return;
    setParams({ q: debounced }, { replace: true });
    const next = [debounced, ...recent.filter((item) => item !== debounced)].slice(0, 5);
    setRecent(next); localStorage.setItem('cinepick-searches', JSON.stringify(next));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return <div className="standard-page search-page page-enter">
    <div className="search-hero"><p className="eyebrow">Movies, shows & people</p><h1>Search the universe</h1><div className="giant-search"><Search size={24} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a title, actor, or director" /></div></div>
    {!query && recent.length > 0 && <div className="recent-searches"><h3><Clock3 size={17} /> Recent searches</h3><div>{recent.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div></div>}
    {query && <div className="search-results-head"><h2>Results for “{debounced}”</h2><span>{data.length + people.length} found</span></div>}
    {people.length > 0 && <section className="people-results"><p className="eyebrow">People</p><div>{people.map((person) => <Link to={`/person/${person.id}`} key={person.id} className="person-result">{person.photo ? <img src={person.photo} alt={person.name} /> : <span><UserRound size={20} /></span>}<div><b>{person.name}</b><small>{person.role}</small></div></Link>)}</div></section>}
    {isLoading ? <LoadingGrid /> : isError ? <div className="empty-state"><h2>Search is taking a break</h2><p>Check your connection and try again.</p></div> : data.length > 0 ? <div className="movie-grid search-grid">{data.map((movie) => <MovieCard key={`${movie.type}-${movie.id}`} movie={movie} />)}</div> : people.length === 0 && query && debounced === query ? <div className="empty-state"><span>⌁</span><h2>No stories found</h2><p>Try another title, person, or a broader phrase.</p></div> : null}
  </div>;
}
