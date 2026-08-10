import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bookmark, Play, Sparkles, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingGrid, MovieRow } from '../components/MovieCard';
import { getHomeFeed } from '../services/tmdb';
import { useLibrary } from '../store/LibraryContext';
import { mediaKey } from '../utils/mediaKey';

export default function HomePage() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['home-feed'], queryFn: getHomeFeed });
  const navigate = useNavigate();
  const library = useLibrary();

  if (isLoading) return <div className="standard-page"><LoadingGrid /></div>;
  if (isError || !data?.trending.length) return <div className="standard-page empty-state"><span>↻</span><h1>TMDB is unavailable</h1><p>Check your API key and connection, then try again.</p><button className="primary-btn" onClick={() => refetch()}>Try again</button></div>;

  const hero = data.trending[0];
  const recommended = data.topRated.filter((movie) => !library.watched.includes(mediaKey(movie))).slice(0, 12);
  const surprisePool = [...data.trending, ...data.popular];
  const surprise = () => { const movie = surprisePool[Math.floor(Math.random() * surprisePool.length)]; navigate(`/${movie.type}/${movie.id}`); };

  return <div className="home-page page-enter">
    <section className="hero" style={{ '--hero-image': `url(${hero.backdrop})` } as React.CSSProperties}>
      <div className="hero-content">
        <div className="hero-badges"><span className="badge accent">Trending now</span><span className="badge"><Star size={13} fill="currentColor" /> {hero.rating.toFixed(1)}</span><span>{hero.year}</span><span>{hero.type === 'movie' ? 'Movie' : 'Series'}</span></div>
        <h1>{hero.title}</h1><p>{hero.overview}</p>
        <div className="hero-actions">
          <Link className="primary-btn" to={`/${hero.type}/${hero.id}`}><Play size={17} fill="currentColor" /> View title</Link>
          <button className={`secondary-btn ${library.inList('watchlist', hero) ? 'added' : ''}`} onClick={() => library.toggle('watchlist', hero)}><Bookmark size={17} fill={library.inList('watchlist', hero) ? 'currentColor' : 'none'} /> {library.inList('watchlist', hero) ? 'In watchlist' : 'Add to watchlist'}</button>
        </div>
      </div><div className="hero-dots"><i className="active" /><i /><i /><i /></div>
    </section>
    <section className="decision-band"><div><span className="spark-icon"><Sparkles size={22} /></span><div><p className="eyebrow">Decision fatigue? We’ve got you.</p><h2>What should I watch tonight?</h2><p>Tell us your mood and company. We’ll search TMDB and return three strong picks.</p></div></div><div className="decision-actions"><button className="primary-btn" onClick={() => navigate('/pick')}>Find my movie <ArrowRight size={17} /></button><button className="roulette-btn" onClick={surprise}>🎲 Surprise me</button></div></section>
    <MovieRow title="Trending this week" kicker="Everyone’s watching" items={data.trending.slice(0, 12)} numbered />
    <MovieRow title="Recommended for you" kicker="Top rated, excluding watched" items={recommended} />
    <MovieRow title="Popular movies" kicker="Big stories, right now" items={data.popular.slice(0, 12)} />
    <MovieRow title="Top rated" kicker="Loved by audiences" items={data.topRated.slice(0, 12)} />
    <MovieRow title="Now playing" kicker="Fresh from the big screen" items={data.nowPlaying.slice(0, 12)} />
    <MovieRow title="Upcoming & anticipated" kicker="Add them to your radar" items={data.upcoming.slice(0, 12)} />
    <MovieRow title="Popular TV shows" kicker="Your next obsession" items={data.popularTv.slice(0, 12)} />
    <section className="continue-panel"><div className="continue-copy"><p className="eyebrow">Continue exploring</p><h2>Save the stories that stay with you.</h2><p>Your library gets smarter with every title you watch, rate, and love.</p><Link to="/library" className="text-link">Open my library <span>→</span></Link></div><div className="stacked-posters">{data.topRated.slice(0, 3).map((movie) => <img key={movie.id} src={movie.poster} alt="" />)}</div></section>
  </div>;
}
