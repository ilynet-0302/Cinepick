import { useQuery } from '@tanstack/react-query';
import { Bookmark, CheckCircle2, Heart, Library } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingGrid, MovieCard } from '../components/MovieCard';
import { getTitlesByKeys } from '../services/tmdb';
import { useLibrary } from '../store/LibraryContext';
import type { ListType } from '../types';
import { mediaKey } from '../utils/mediaKey';

const tabs: { value: ListType; label: string; icon: typeof Bookmark }[] = [
  { value: 'watchlist', label: 'Watchlist', icon: Bookmark }, { value: 'favorite', label: 'Favorites', icon: Heart }, { value: 'watched', label: 'Watched', icon: CheckCircle2 },
];

export default function LibraryPage() {
  const library = useLibrary();
  const [tab, setTab] = useState<ListType>('watchlist');
  const [sort, setSort] = useState('added');
  const keys = library[tab];
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ['library-titles', tab, keys], queryFn: () => getTitlesByKeys(keys), enabled: keys.length > 0 });
  const list = useMemo(() => [...data].sort((a, b) => sort === 'rating' ? b.rating - a.rating : sort === 'year' ? b.year - a.year : keys.indexOf(mediaKey(b)) - keys.indexOf(mediaKey(a))), [data, keys, sort]);

  return <div className="standard-page library-page page-enter">
    <div className="page-title-row"><div><p className="eyebrow">All your stories</p><h1>My library</h1><p>Everything you want to watch, loved, and finished.</p></div><div className="library-summary"><span><b>{library.watchlist.length}</b> queued</span><span><b>{library.watched.length}</b> watched</span></div></div>
    {(library.cloudLoading || library.syncError) && <div className={`sync-banner ${library.syncError ? 'error' : ''}`}><span />{library.syncError || 'Synchronizing your library…'}</div>}
    <div className="library-toolbar"><div className="library-tabs">{tabs.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => setTab(value)} className={tab === value ? 'active' : ''}><Icon size={17} />{label}<span>{library[value].length}</span></button>)}</div><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="added">Recently added</option><option value="rating">Highest rated</option><option value="year">Newest</option></select></div>
    {isLoading ? <LoadingGrid /> : isError ? <div className="empty-state"><h2>Couldn’t load your library</h2><button className="primary-btn" onClick={() => refetch()}>Try again</button></div> : list.length ? <div className="movie-grid library-grid">{list.map((movie) => <MovieCard key={mediaKey(movie)} movie={movie} />)}</div> : <div className="empty-state"><span><Library size={38} /></span><h2>Your {tab} is waiting</h2><p>Explore TMDB and use the quick actions on any title.</p><Link className="primary-btn" to="/discover">Discover titles</Link></div>}
  </div>;
}
