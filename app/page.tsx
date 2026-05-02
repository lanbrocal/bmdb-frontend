"use client";

import { useState, useEffect } from 'react';

// TMDB Interface
interface Movie {
  tmdb_id: number;
  title: string;
  release_date: string;
  vote_average: number;
  overview: string;
  poster_path: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies';
const SEARCH_API_URL = 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/searchmovie';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null); // Holds OMDb data
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch trending movies when the page first loads
  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch trending movies');
      const data = await res.json();
      setTrendingMovies(data);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError('Failed to load trending movies.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    setSearchResult(null); // Clear previous results

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
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 text-blue-500">Blue Mountain Database</h1>
        <p className="text-gray-400">Popular Movies Synced from TMDB & OMDb</p>
      </header>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a movie (e.g., The Matrix)..." 
            className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Search
          </button>
          {searchResult && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* --- NOTIFICATIONS / LOADING --- */}
      {isLoading && <div className="text-center text-blue-400 mb-8 animate-pulse">Loading data...</div>}
      {error && <div className="text-center text-red-500 mb-8">{error}</div>}

      {/* --- OMDB SEARCH RESULT VIEW --- */}
      {searchResult && !isLoading ? (
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row">
          {searchResult.Poster !== "N/A" && (
            <img 
              src={searchResult.Poster} 
              alt={searchResult.Title} 
              className="w-full md:w-1/3 object-cover"
            />
          )}
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">{searchResult.Title} <span className="text-gray-500 text-xl font-normal">({searchResult.Year})</span></h2>
            <div className="flex gap-3 mb-6 flex-wrap">
              <span className="bg-blue-900/50 text-blue-300 border border-blue-800 px-3 py-1 rounded text-sm font-medium">⭐ {searchResult.imdbRating}/10</span>
              <span className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded text-sm font-medium">{searchResult.Rated}</span>
              <span className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded text-sm font-medium">{searchResult.Runtime}</span>
            </div>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
              {searchResult.Plot}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong className="text-gray-200">Director:</strong> {searchResult.Director}</p>
              <p><strong className="text-gray-200">Actors:</strong> {searchResult.Actors}</p>
              <p><strong className="text-gray-200">Box Office:</strong> {searchResult.BoxOffice}</p>
            </div>
          </div>
        </div>
      ) : (
        /* --- TMDB TRENDING GRID VIEW --- */
        !isLoading && !searchResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {trendingMovies.length > 0 ? (
              trendingMovies.map((movie) => (
                <div key={movie.tmdb_id} className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 hover:border-blue-500 transition-all group cursor-pointer" onClick={() => { setSearchQuery(movie.title); handleSearch(); }}>
                  <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                    {movie.poster_path ? (
                      <img 
                        src={`${IMAGE_BASE_URL}${movie.poster_path}`} 
                        alt={movie.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-600">No Poster</div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-bold leading-tight mb-1 truncate">{movie.title}</h2>
                    <p className="text-gray-500 text-xs mb-3">{new Date(movie.release_date).getFullYear()}</p>
                    <p className="text-gray-400 text-xs line-clamp-2 italic">{movie.overview}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 italic">No movies found in the database.</p>
              </div>
            )}
          </div>
        )
      )}
    </main>
  );
}
