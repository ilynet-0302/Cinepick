import { ArrowLeft, ArrowRight, Check, Dice5, Heart, RefreshCw, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MovieCard } from '../components/MovieCard';
import { genres } from '../data/genres';
import { getMatchReasons, type PickCriteria } from '../features/picker/recommendationEngine';
import { getMoviePicks } from '../services/tmdb';
import { useLibrary } from '../store/LibraryContext';
import { parseMediaKey } from '../utils/mediaKey';

const moods = [
  { value: 'Funny', emoji: '😄', genres: ['Comedy'] }, { value: 'Scary', emoji: '😱', genres: ['Thriller', 'Mystery'] },
  { value: 'Mind-bending', emoji: '🧠', genres: ['Sci-Fi', 'Mystery'] }, { value: 'Emotional', emoji: '🥲', genres: ['Drama', 'Romance'] },
  { value: 'Intense', emoji: '🔥', genres: ['Thriller', 'Adventure'] }, { value: 'Relaxing', emoji: '😌', genres: ['Animation', 'Comedy'] },
  { value: 'Romantic', emoji: '❤️', genres: ['Romance', 'Drama'] },
];
const times = [{ value: 'short', label: 'Quick watch', sub: 'Under 110 min' }, { value: 'medium', label: 'Feature length', sub: '110–150 min' }, { value: 'long', label: 'Epic', sub: 'Over 150 min' }];
const companies = [{ value: 'alone', icon: '◉', label: 'Just me' }, { value: 'couple', icon: '♡', label: 'Date night' }, { value: 'friends', icon: '♧', label: 'With friends' }, { value: 'family', icon: '⌂', label: 'Family time' }];

export default function PickPage() {
  const library = useLibrary();
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState('');
  const [time, setTime] = useState('');
  const [company, setCompany] = useState('');
  const [minRating, setMinRating] = useState(7);
  const [genre, setGenre] = useState('All');
  const [minYear, setMinYear] = useState(0);
  const [includeWatched, setIncludeWatched] = useState(false);
  const [shuffle, setShuffle] = useState(0);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);

  const criteria = useMemo<PickCriteria>(() => ({
    moodGenres: moods.find((item) => item.value === mood)?.genres || [],
    companyGenres: company === 'family' ? ['Family', 'Animation', 'Adventure'] : company === 'friends' ? ['Comedy', 'Adventure', 'Thriller'] : company === 'couple' ? ['Romance', 'Drama', 'Comedy'] : [],
    time: time as PickCriteria['time'], minRating, preferredGenre: genre,
    minYear: minYear || undefined, includeWatched, watchedIds: library.watched.map(parseMediaKey).filter((item) => item?.type === 'movie').map((item) => item!.id),
    excludedIds, seed: shuffle,
  }), [mood, time, company, minRating, genre, minYear, includeWatched, library.watched, excludedIds, shuffle]);

  const { data: picks = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['movie-picks', criteria], queryFn: () => getMoviePicks(criteria), enabled: step === 5,
  });

  const pickAgain = () => {
    setExcludedIds((current) => [...new Set([...current, ...picks.map((movie) => movie.id)])]);
    setShuffle((current) => current + 1);
  };

  const changeAnswers = () => { setExcludedIds([]); setShuffle(0); setStep(1); };

  if (step === 5 && isLoading) return <div className="standard-page pick-results page-enter"><div className="pick-result-head"><span className="spark-icon large"><Sparkles size={28} /></span><p className="eyebrow">Reading the room</p><h1>Picking your three…</h1><p>Matching mood, runtime, company, rating, and watch history.</p></div><div className="pick-loading">{[1,2,3].map((item) => <div key={item}><i /><span /><small /></div>)}</div></div>;

  if (step === 5 && isError) return <div className="standard-page pick-results page-enter"><div className="empty-state"><span>↻</span><h1>We couldn’t make the shortlist</h1><p>Check your TMDB connection or try the request again.</p><button className="primary-btn" onClick={() => refetch()}>Try again</button><button className="text-button" onClick={changeAnswers}>Change my answers</button></div></div>;

  if (step === 5) return <div className="standard-page pick-results page-enter"><div className="pick-result-head"><span className="spark-icon large"><Sparkles size={28} /></span><p className="eyebrow">Chosen for your {mood.toLowerCase() || 'movie'} mood</p><h1>Your three for tonight</h1><p>A ranked shortlist built entirely from live TMDB results and every answer you gave us.</p><div className="picker-summary"><span>{mood}</span><span>{times.find((item) => item.value === time)?.label}</span><span>{companies.find((item) => item.value === company)?.label}</span><span>{minRating.toFixed(1)}+ rated</span></div></div>{picks.length ? <><div className={`pick-grid ${isFetching ? 'refreshing' : ''}`}>{picks.map((movie) => <div key={movie.id}><MovieCard movie={movie} /><div className="match-reasons">{getMatchReasons(movie, criteria).map((reason) => <span key={reason}>{reason}</span>)}</div><Link className="watch-this" to={`/${movie.type}/${movie.id}`}>Watch this <ArrowRight size={16} /></Link></div>)}</div><div className="result-actions"><button className="secondary-btn" disabled={isFetching} onClick={pickAgain}><RefreshCw size={17} /> {isFetching ? 'Finding more…' : 'Give me three more'}</button><button className="text-button" onClick={changeAnswers}>Change my answers</button></div></> : <div className="empty-state"><h2>No matches yet</h2><p>Try lowering the minimum rating or changing the runtime.</p><button className="primary-btn" onClick={changeAnswers}>Change my answers</button></div>}</div>;

  return <div className="standard-page pick-page page-enter">
    <div className="pick-top"><Link to="/"><ArrowLeft size={17} /> Home</Link><div className="step-counter">{[1,2,3,4].map((n) => <i key={n} className={n <= step ? 'active' : ''} />)}<span>{step} / 4</span></div></div>
    <section className="pick-card">
      <div className="pick-card-head"><span className="spark-icon"><Sparkles size={21} /></span><p className="eyebrow">Let’s make this easy</p><h1>{step === 1 ? 'How do you want to feel?' : step === 2 ? 'How much time do you have?' : step === 3 ? 'Who’s watching?' : 'One last touch'}</h1><p>{step === 1 ? 'Pick the mood you want your movie to leave you with.' : step === 2 ? 'We’ll keep the runtime within your evening’s limits.' : step === 3 ? 'The right movie depends on the room.' : 'Fine-tune the shortlist, or trust our defaults.'}</p></div>
      {step === 1 && <div className="choice-grid mood-grid">{moods.map((item) => <button key={item.value} className={mood === item.value ? 'active' : ''} onClick={() => setMood(item.value)}><span>{item.emoji}</span>{item.value}{mood === item.value && <Check size={16} />}</button>)}</div>}
      {step === 2 && <div className="choice-grid time-grid">{times.map((item) => <button key={item.value} className={time === item.value ? 'active' : ''} onClick={() => setTime(item.value)}><b>{item.label}</b><small>{item.sub}</small></button>)}</div>}
      {step === 3 && <div className="choice-grid company-grid">{companies.map((item) => <button key={item.value} className={company === item.value ? 'active' : ''} onClick={() => setCompany(item.value)}><span>{item.icon}</span><b>{item.label}</b></button>)}</div>}
      {step === 4 && <div className="fine-tune"><label>Minimum rating <b>{minRating.toFixed(1)}+</b><input type="range" min="5" max="9" step="0.5" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} /></label><label>Preferred genre<select value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((item) => <option key={item}>{item}</option>)}</select></label><label>Released after<select value={minYear} onChange={(e) => setMinYear(Number(e.target.value))}><option value="0">Any year</option><option value="2020">2020</option><option value="2015">2015</option><option value="2010">2010</option><option value="2000">2000</option><option value="1990">1990</option></select></label><label className="toggle-label"><span><Heart size={18} /> Include movies I’ve watched</span><input type="checkbox" checked={includeWatched} onChange={(e) => setIncludeWatched(e.target.checked)} /></label></div>}
      <div className="pick-footer"><button className="text-button" disabled={step === 1} onClick={() => setStep((n) => n - 1)}>Back</button><button className="primary-btn" disabled={(step === 1 && !mood) || (step === 2 && !time) || (step === 3 && !company)} onClick={() => setStep((n) => n + 1)}>{step === 4 ? <><Dice5 size={18} /> Pick my movies</> : <>Continue <ArrowRight size={17} /></>}</button></div>
    </section>
  </div>;
}
