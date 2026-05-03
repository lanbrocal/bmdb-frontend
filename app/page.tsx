"use client";

import { useState, useEffect } from 'react';

// 1. Updated Interface to include is_etrain_pick
interface Movie {
  tmdb_id: number;
  title: string;
  release_date: string;
  vote_average: number;
  overview: string;
  poster_path: string;
  rt_score: string; 
  is_etrain_pick: boolean; // Added this
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies';
const SEARCH_API_URL = 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/searchmovie';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Home() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [displayMovies, setDisplayMovies] = useState<Movie[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'all' | 'picks'>('all');

  useEffect(() => {
    fetchTrending();
  }, []);

  // Update visible movies when view toggle or allMovies changes
  useEffect(() => {
    if (view === 'picks') {
      setDisplayMovies(allMovies.filter(m => m.is_etrain_pick));
    } else {
      setDisplayMovies(allMovies);
    }
  }, [view, allMovies]);

  const fetchTrending = async () => {
    setIsLoading(true);
    setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Database is currently unavailable.');
      const data = await res.json();
      setAllMovies(data);
    } catch (err: any) {
      setError(err.name === 'AbortError' ? 'Database timeout. Try again.' : 'Failed to load movies.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError('');
    setSearchResult(null); 
    try {
      const res = await fetch(`${SEARCH_API_URL}?title=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok && data.Response === "True") setSearchResult(data);
      else setError(data.error || 'Movie not found.');
    } catch (err) { setError('Search failed.'); }
    finally { setIsLoading(false); }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setError('');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 text-blue-500 italic uppercase tracking-tighter">Bad Movie Database</h1>
        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={() => setView('all')}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${view === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            ALL DISASTERS
          </button>
          <button 
            onClick={() => setView('picks')}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${view === 'picks' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}
          >
            💎 ETRAIN'S PICKS
          </button>
        </div>
      </header>

      {/* SEARCH BAR SECTION */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a disaster..." 
            className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50">
            Search
          </button>
          {(searchResult || error) && (
            <button type="button" onClick={clearSearch} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold">
              Reset
            </button>
          )}
        </form>
      </div>

      {isLoading && <div className="text-center py-20 animate-pulse text-blue-400 font-bold">Waking up the database...</div>}
      
      {!isLoading && !error && (
        searchResult ? (
          /* OMDB SEARCH RESULT VIEW */
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row">
            {searchResult.Poster !== "N/A" && <img src={searchResult.Poster} alt="Poster" className="w-full md:w-1/3 object-cover border-r border-gray-800" />}
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-2">{searchResult.Title} <span className="text-gray-500 text-xl font-normal">({searchResult.Year})</span></h2>
              <div className="flex gap-3 mb-6 flex-wrap">
                <span className="bg-blue-900/50 text-blue-300 border border-blue-800 px-3 py-1 rounded text-sm font-medium">⭐ {searchResult.imdbRating}/10</span>
                <span className="bg-red-900/50 text-red-300 border border-red-800 px-3 py-1 rounded text-sm font-medium">
                  🍅 {searchResult.Ratings?.find((r:any) => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'}
                </span>
              </div>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed border-l-4 border-blue-500 pl-4 italic">{searchResult.Plot}</p>
            </div>
          </div>
        ) : (
          /* THE MOVIE CARD GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {displayMovies.map((movie) => (
              <div 
                key={movie.tmdb_id} 
                className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 hover:border-blue-500 transition-all group cursor-pointer relative" 
                onClick={() => { setSearchQuery(movie.title); handleSearch(); }}
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                  {/* --- ETRAIN'S PICK BADGE --- */}
                  {movie.is_etrain_pick && (
                    <div className="absolute top-2 left-2 z-10 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 border border-blue-400">
                      <span>💎</span> ETRAIN'S PICK
                    </div>
                  )}

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
                  <p className="text-gray-400 text-xs line-clamp-2 italic">{movie.overview}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
}
