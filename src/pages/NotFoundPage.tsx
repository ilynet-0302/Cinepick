import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="standard-page empty-state not-found"><span><Compass size={42} /></span><p className="eyebrow">404 · Lost scene</p><h1>This page isn’t in the script.</h1><p>Let’s get you back to stories worth discovering.</p><Link className="primary-btn" to="/">Return home</Link></div>;
}
