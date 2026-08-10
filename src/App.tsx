import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import SearchPage from './pages/SearchPage';
import MoviePage from './pages/MoviePage';
import PersonPage from './pages/PersonPage';
import PickPage from './pages/PickPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';
import ComparePage from './pages/ComparePage';
import NotFoundPage from './pages/NotFoundPage';
import AuthPage from './pages/AuthPage';

export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/discover" element={<DiscoverPage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/movie/:id" element={<MoviePage />} />
    <Route path="/tv/:id" element={<MoviePage />} />
    <Route path="/person/:id" element={<PersonPage />} />
    <Route path="/pick" element={<PickPage />} />
    <Route path="/library" element={<LibraryPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/compare" element={<ComparePage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Layout>;
}
