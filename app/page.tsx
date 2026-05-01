// app/page.tsx
interface Movie {
  tmdb_id: number;
  title: string;
  release_date: string;
  vote_average: number;
  overview: string;
}

async function getMovies(): Promise<Movie[]> {
  const res = await fetch('https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies', {
    next: { revalidate: 3600 } // Refresh data once per hour
  });

  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
}

export default async function Home() {
  const movies = await getMovies();

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Blue Mountain Database</h1>
        <p className="text-gray-400">Popular Movies Synced from TMDB</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {movies.map((movie) => (
          <div key={movie.tmdb_id} className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold leading-tight">{movie.title}</h2>
              <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded">
                ⭐ {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">Released: {movie.release_date}</p>
            <p className="text-gray-300 text-sm line-clamp-3">{movie.overview}</p>
          </div>
        ))}
      </div>
    </main>
  );
}