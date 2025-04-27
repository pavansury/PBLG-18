import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Users, ArrowLeft, PlayCircle, ListPlus } from 'lucide-react';
import { useRecommendations } from '../context/RecommendationContext';
import { getMovieDetails, getMovieRecommendations } from '../services/movieService';
import { Movie } from '../types/movie';
import MovieList from '../components/movies/MovieList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToRecentlyViewed } = useRecommendations();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const movieData = await getMovieDetails(id);
        setMovie(movieData);
        
        // Add to recently viewed
        addToRecentlyViewed(movieData, 'movie');
        
        // Fetch recommendations
        const recommendationsData = await getMovieRecommendations(id);
        setRecommendations(recommendationsData);
      } catch (err) {
        setError('Failed to load movie details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [id, addToRecentlyViewed]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Movie not found.'}
          </p>
          <button
            onClick={handleBackClick}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      {/* Movie Hero Section */}
      <section className="relative">
        {movie.backdrop_path && (
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
            <img 
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
              alt={movie.title}
              className="w-full h-full object-cover object-top opacity-40"
            />
          </div>
        )}
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-20">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBackClick}
            className="flex items-center text-white mb-8 hover:text-primary-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </motion.button>
          
          <div className="flex flex-col md:flex-row gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4 max-w-[300px] mx-auto md:mx-0"
            >
              {movie.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">No poster available</span>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-grow text-white"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-xl text-gray-300 italic mb-6">"{movie.tagline}"</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {movie.vote_average > 0 && (
                  <div className="flex items-center">
                    <Star size={20} className="text-yellow-400 mr-1" />
                    <span>{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                {movie.runtime > 0 && (
                  <div className="flex items-center">
                    <Clock size={20} className="mr-1" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
                
                {movie.release_date && (
                  <div className="flex items-center">
                    <Calendar size={20} className="mr-1" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-gray-300 leading-relaxed">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>
              
              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map(genre => (
                      <Badge key={genre.id} variant="primary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mt-8">
                <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors">
                  <PlayCircle size={20} />
                  <span>Watch Trailer</span>
                </button>
                
                <button className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-md transition-colors">
                  <ListPlus size={20} />
                  <span>Add to Watchlist</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Additional Details */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {movie.vote_count > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Votes
                </h3>
                <div className="flex items-center">
                  <Users size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{movie.vote_count.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            {movie.popularity > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Popularity
                </h3>
                <div className="flex items-center">
                  <TrendingUp size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{movie.popularity.toFixed(1)}</span>
                </div>
              </div>
            )}
            
            {movie.original_language && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Language
                </h3>
                <div className="flex items-center">
                  <Globe size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {movie.original_language.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {movie.status && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </h3>
                <div className="flex items-center">
                  <Info size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{movie.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              You May Also Like
            </h2>
            
            <MovieList 
              movies={recommendations.slice(0, 6)} 
              loading={false}
              error={null}
            />
          </div>
        </section>
      )}
    </div>
  );
};

// Define the missing imports
function TrendingUp(props: any) {
  return <lucide.TrendingUp {...props} />;
}

function Globe(props: any) {
  return <lucide.Globe {...props} />;
}

function Info(props: any) {
  return <lucide.Info {...props} />;
}

const lucide = {
  TrendingUp: (props: any) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
        <polyline points="16 7 22 7 22 13"></polyline>
      </svg>
    );
  },
  Globe: (props: any) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    );
  },
  Info: (props: any) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    );
  }
};

export default MovieDetailsPage;