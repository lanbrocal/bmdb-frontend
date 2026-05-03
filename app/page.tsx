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
  genre: string; // Added for the genre filter
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies';
const SEARCH_API_URL = 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/searchmovie';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Home() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [searchResult, setSearchResult] = useState<any>(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All'); // Added state for filter
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
  // 1. Extract unique genres from the loaded movies
  const genres = ['All', ...Array.from(new Set(allMovies.map(m => m
