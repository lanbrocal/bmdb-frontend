"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Movie {
  tmdb_id: number;
  title: string;
  release_date: string;
  vote_average: number;
  overview: string;
  poster_path: string;
  rt_score: string; 
  is_etrain_pick: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function HallOfShame() {
  const [picks, setPicks] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        // Only show your curated picks
        setPicks(data.filter((m: Movie) => m.is_etrain_pick));
      } catch (err) {
        console.error("Failed to load Hall of Shame", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPicks();
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-12 text-center">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 inline-block transition-colors">
          ← Back to All Disasters
        </Link>
        <h1 className="text-5xl font-extrabold mb-2 text-yellow-500 italic uppercase tracking-tighter shadow-yellow-900/20 drop-shadow-md">
          Hall of Shame
        </h1>
        <p className="text-gray-400 font-mono text-xs">Etrain's Curated Selection of Cinematic Failures</p>
      </header>

      {isLoading ? (
        <div className="text-center py-20 animate-pulse text-yellow-500 font-bold tracking-widest">
          CURATING THE CRIMES...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {picks.length > 0 ? (
            picks.map((movie) => (
              <div key={movie.tmdb_id} className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-yellow-900/30 hover:border-yellow-500 transition-all group relative">
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                  <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 border border-yellow-400">
                    <span>💎</span> ETRAIN'S PICK
                  </div>
                  <img 
                    src={`${IMAGE_BASE_URL}${movie.poster_path}`} 
                    alt={movie.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                    <span>🍅</span> {movie.rt_score || 'N/A'}
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold leading-tight mb-1 truncate">{movie.title}</h2>
                  <p className="text-gray-500 text-xs mb-3">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                  <p className="text-gray-400 text-xs line-clamp-3 italic">{movie.overview}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-500 italic">No one has been inducted into the Hall of Shame yet.</p>
              <p className="text-gray-600 text-sm mt-2">Run the SQL update to tag your favorites!</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}