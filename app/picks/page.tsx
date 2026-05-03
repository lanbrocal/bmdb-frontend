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
  genre: string; // Added for consistency
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
        // Filter for your curated picks
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
      {/* --- MATCHING HEADER WITH HALL OF SHAME ACTIVE --- */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2 text-blue-500 italic uppercase tracking-tighter">
          Bad Movie Database
        </h1>
        <nav className="flex justify-center gap-4 mt-4">
          <Link 
            href="/" 
            className="px-4 py-1 rounded-full text-xs font-bold transition-all bg-gray-900 text-gray-400 hover:bg-blue-600 hover:text-white"
          >
            ALL DISASTERS
          </Link>
          <Link 
            href="/picks" 
            className="px-4 py-1 rounded-full text-xs font-bold transition-all bg-yellow-500 text-black border border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
          >
            💎 HALL OF SHAME
          </Link>
        </nav>
        <p className="text-gray-500 font-mono text-[10px] mt-6 uppercase tracking-[0.2em]">
          Etrain's Curated Selection of Cinematic Failures
        </p>
      </header>

      {isLoading ? (
        <div className="text-center py-20 animate-pulse text-yellow-500 font-bold tracking-widest uppercase">
          Reviewing the evidence...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {picks.length > 0 ? (
            picks.map((movie) => (
              <div 
                key={movie.tmdb_id} 
                className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-yellow-900/30 hover:border-yellow-500 transition-all group relative"
              >
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
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h2 className="text-sm font-bold leading-tight truncate">{movie.title}</h2>
                    {/* Genre Badge Added Here */}
                    <span className="text-[9px] font-mono text-yellow-600 uppercase border border-yellow-900/50 px-1 rounded">
                        {movie.genre}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[10px] mb-3">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                  <p className="text-gray-400 text-[11px] line-clamp-3 italic leading-relaxed">{movie.overview}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-500 italic">No one has been inducted into the Hall of Shame yet.</p>
              <Link href="/" className="text-blue-400 text-xs mt-4 inline-block underline">
                Go find some disasters to tag
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
