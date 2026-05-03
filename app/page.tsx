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
  genre: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies';
const SEARCH_API_URL = 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/searchmovie';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Home() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrending();
  }, []);

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
      if (err.name === 'AbortError') {
        setError('Database timeout. The server might be waking up—please try again.');
      } else {
        setError('Failed to load movies.');
      }
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
    setSelectedGenre('All');
  };

  // --- GENRE FILTER LOGIC ---
  const genres = ['All', ...Array.from(new Set(allMovies.map(m => m.genre).filter(Boolean)))];

  const filteredMovies = selectedGenre === 'All' 
    ? allMovies 
    : allMovies.filter(m => m.genre === selectedGenre);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 text-blue-500 italic uppercase tracking-tighter">
          Bad Movie Database
        </h1>
        <nav className="flex justify-center gap-4 mt-4">
          <Link 
            href="/" 
            className="px-4 py-1 rounded-full text-xs font-bold transition-all bg-blue-600 text-white border border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
          >
            ALL DISASTERS
          </Link>
          <Link 
            href="/picks" 
            className="px-4 py-1 rounded-full text-xs font-bold transition-all bg-gray-900 text-gray-400 hover:bg-yellow-500 hover:text-black hover:scale-105"
          >
            💎 HALL OF SHAME
          </Link>
        </nav>
      </header>

      <div className="max-w-2xl mx-auto mb-12 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a specific crime..." 
            className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50">
            Search
          </button>
          {(searchResult || error || selectedGenre !== 'All') && (
            <button type="button" onClick={clearSearch} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Reset
            </button>
          )}
        </form>

        {!searchResult && !isLoading && !error && (
          <div className="flex items-center justify-center gap-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filter By Genre:</label>
            <select 
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-blue-400 text-xs font-bold px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 cursor-pointer uppercase transition-all"
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-20 animate-pulse">
          <p className="text-blue-400 text-xl font-bold italic uppercase">Opening the Archive...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl max-w-2xl mx-auto">
          <p className="text-red-500 mb-4 font-bold">{error}</p>
          <button onClick={fetchTrending} className="text-blue-400 underline hover:text-blue-300">
            🔄 Refresh
          </button>
        </div>
      )}
      
      {!isLoading && !error && (
        searchResult ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {filteredMovies.map((movie) => (
              <div 
                key={movie.tmdb_id} 
                className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 hover:border-blue-500 transition-all group cursor-pointer relative" 
                onClick={() => { setSearchQuery(movie.title); handleSearch(); }}
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
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
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h2 className="text-sm font-bold leading-tight truncate">{movie.title}</h2>
                    <span className="text-[10px] font-mono text-gray-600 uppercase border border-gray-800 px-1 rounded">{movie.genre}</span>
                  </div>
                  <p className="text-gray-500 text-[10px] mb-3">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                  <p className="text-gray-400 text-[11px] line-clamp-2 italic leading-relaxed">{movie.overview}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
}
