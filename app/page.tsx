"use client";

import { useState, useEffect } from 'react';

// 1. Updated Interface to include the Rotten Tomatoes score
interface Movie {
  tmdb_id: number;
  title: string;
  release_date: string;
  vote_average: number;
  overview: string;
  poster_path: string;
  rt_score: string; 
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies';
const SEARCH_API_URL = 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/searchmovie';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch trending movies when the page first loads
  useEffect(() => {
    fetchTrending();
  }, []);

  // 2. Enhanced fetch with 15s Timeout logic for SQL "Cold Starts"
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
      setTrendingMovies(data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('The database is taking a while to wake up. Please click "Try Again" in a few seconds.');
      } else {
        console.error("Failed to fetch movies:", err);
        setError('Failed to load infamous movies.');
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
      
      if (res.ok && data.Response === "True") {
        setSearchResult(data);
      } else {
        setError(data.error || data.Error || 'Movie not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to search for movie.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setError('');
    if (trendingMovies.length === 0) fetchTrending();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 text-blue-500 italic uppercase tracking-tighter">Bad Movie Database</h1>
        <p className="text-gray-400 font-mono text-sm">"Oh Hi Mark"</p>
      </header>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a disaster (e.g., Gigli)..." 
            className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Search
          </button>
          {(searchResult || error) && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* --- NOTIFICATIONS / LOADING --- */}
      {isLoading && (
        <div className="text-center py-20 animate-pulse">
          <p className="text-blue-400 text-xl font-bold">Waking up the database...</p>
          <p className="text-gray-500 text-sm mt-2">This usually takes about 15 seconds on the first load.</p>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
          <p className="text-red-500 mb-4 font-bold">{error}</p>
          <button onClick={fetchTrending} className="text-blue-400 underline hover:text-blue-300">
            🔄 Click to Try Again
          </button>
        </div>
      )}

      {/* --- OMDB SEARCH RESULT VIEW --- */}
      {searchResult && !isLoading ? (
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row animate-in fade-in duration-500">
          {searchResult.Poster !== "N/A" && (
            <img 
              src={searchResult.Poster} 
              alt={searchResult.Title} 
              className="w-full md:w-1/3 object-cover border-r border-gray-800"
            />
          )}
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">{searchResult.Title} <span className="text-gray-500 text-xl font-normal">({searchResult.Year})</span></h2>
            <div className="flex gap-3 mb-6 flex-wrap">
              <span className="bg-blue-900/50 text-blue-300 border border-blue-800 px-3 py-1 rounded text-sm font-medium">⭐ {searchResult.imdbRating}/10</span>
              <span className="bg-red-900/50 text-red-300 border border-red-800 px-3 py-1 rounded text-sm font-medium">
                🍅 {searchResult.Ratings?.find((r:any) => r.Source === 'Rotten Tomatoes')?.Value || searchResult.RT_Score || 'N/A'}
              </span>
            </div>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
              {searchResult.Plot}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong className="text-gray-200">Director:</strong> {searchResult.Director || 'N/A'}</p>
              <p><strong className="text-gray-200">Actors:</strong> {searchResult.Actors || 'N/A'}</p>
              {searchResult.Source && <p className="text-blue-500/50 mt-4 font-mono text-[10px]">Source: {searchResult.Source}</p>}
            </div>
          </div>
        </div>
      ) : (
        /* --- TMDB TRENDING GRID VIEW --- */
        !isLoading && !searchResult && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {trendingMovies.length > 0 ? (
              trendingMovies.map((movie) => (
                <div 
                  key={movie.tmdb_id} 
                  className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 hover:border-blue-500 transition-all group cursor-pointer relative" 
                  onClick={() => { setSearchQuery(movie.title); handleSearch(); }}
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                    {movie
