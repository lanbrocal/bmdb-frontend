// app/page.tsx
interface Movie {
  tmdb_id: number;
  title: string;
  release_date: string;
  vote_average: number;
  overview: string;
  poster_path: string; // Add this line
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bmdbfuncv2-d7ech6d9hqguabe7.westus-01.azurewebsites.net/api/getmovies';

// TMDB Image Base URL (w500 is the width)
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function getMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      console.error(`API returned an error: ${res.status}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return [];
  }
}

export default async function Home() {
  const movies = await getMovies();

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2 text-blue-500">Blue Mountain Database</h1>
        <p className="text-gray-400">Popular Movies Synced from TMDB</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.tmdb_id} className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 hover:border-blue-500 transition-all group">
              {/* Poster Image */}
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
    </main>
  );
}
