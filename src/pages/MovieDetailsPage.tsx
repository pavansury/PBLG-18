import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Users, ArrowLeft, PlayCircle, TrendingUp, Globe, Info, Share2, Heart, Bookmark, X } from 'lucide-react';
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
  const trailerModalRef = useRef<HTMLDivElement>(null);
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  // Check if movie is in favorites or watchlist from localStorage
  useEffect(() => {
    if (!id) return;
    
    // Check if movie is in favorites
    const favoritesStr = localStorage.getItem('favoriteMovies');
    if (favoritesStr) {
      try {
        const favorites = JSON.parse(favoritesStr);
        setIsFavorite(favorites.includes(id));
      } catch (e) {
        console.error('Error parsing favorites from localStorage:', e);
      }
    }
    
    // Check if movie is in watchlist
    const watchlistStr = localStorage.getItem('movieWatchlist');
    if (watchlistStr) {
      try {
        const watchlist = JSON.parse(watchlistStr);
        setInWatchlist(watchlist.includes(id));
      } catch (e) {
        console.error('Error parsing watchlist from localStorage:', e);
      }
    }
  }, [id]);

  // Handle click outside for modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trailerModalRef.current && !trailerModalRef.current.contains(event.target as Node)) {
        setShowTrailer(false);
      }
    };

    if (showTrailer) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTrailer]);

  useEffect(() => {
    if (!id) return;
    
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to get movie details
        const movieData = await getMovieDetails(id);
        
        // Validate that we have the essential movie data
        if (!movieData || !movieData.title) {
          throw new Error('Invalid movie data received');
        }
        
        setMovie(movieData);
        
        // Check for trailer videos
        if (movieData.videos && movieData.videos.results) {
          const trailers = movieData.videos.results.filter(
            (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
          );
          
          if (trailers.length > 0) {
            setTrailerKey(trailers[0].key);
          }
        }
        
        // Only add to recently viewed if we have valid movie data
        addToRecentlyViewed(movieData, 'movie');
        
        // Then try to get recommendations (but don't fail if this doesn't work)
        try {
          const recommendationsData = await getMovieRecommendations(id);
          if (recommendationsData && recommendationsData.length > 0) {
            setRecommendations(recommendationsData);
          }
        } catch (recErr) {
          // Just log the error but don't fail the whole page
          console.warn('Could not load recommendations:', recErr);
          // Set empty recommendations to avoid undefined errors
          setRecommendations([]);
        }
      } catch (err: any) {
        // Set a user-friendly error message
        if (err.message && err.message.includes('not found')) {
          setError(`Movie not found. The movie with ID ${id} may have been removed or doesn't exist.`);
        } else if (err.message && err.message.includes('API key')) {
          setError('API authorization error. Please try again later.');
        } else {
          setError('Failed to load movie details. Please try again later.');
        }
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [id]); // Removed addToRecentlyViewed from dependencies to prevent infinite loop

  const handleBackClick = () => {
    navigate(-1);
  };

  const toggleFavorite = () => {
    if (!id) return;
    
    const favoritesStr = localStorage.getItem('favoriteMovies');
    let favorites: string[] = [];
    
    if (favoritesStr) {
      try {
        favorites = JSON.parse(favoritesStr);
      } catch (e) {
        console.error('Error parsing favorites from localStorage:', e);
      }
    }
    
    if (isFavorite) {
      // Remove from favorites
      favorites = favorites.filter(movieId => movieId !== id);
    } else {
      // Add to favorites
      favorites.push(id);
    }
    
    localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };
  
  const toggleWatchlist = () => {
    if (!id) return;
    
    const watchlistStr = localStorage.getItem('movieWatchlist');
    let watchlist: string[] = [];
    
    if (watchlistStr) {
      try {
        watchlist = JSON.parse(watchlistStr);
      } catch (e) {
        console.error('Error parsing watchlist from localStorage:', e);
      }
    }
    
    if (inWatchlist) {
      // Remove from watchlist
      watchlist = watchlist.filter(movieId => movieId !== id);
    } else {
      // Add to watchlist
      watchlist.push(id);
    }
    
    localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
    setInWatchlist(!inWatchlist);
  };
  
  const handleShareClick = () => {
    setShowShareOptions(!showShareOptions);
  };
  
  const handleTrailerClick = () => {
    if (trailerKey) {
      setShowTrailer(true);
    }
  };
  
  const closeTrailer = () => {
    setShowTrailer(false);
  };

  // Show loading state with a minimum duration to prevent flicker
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show error state with a helpful message and back button
  if (error || !movie) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Movie not found. Please try another movie.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackClick}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/movies')}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-md transition-colors"
            >
              Browse All Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div ref={trailerModalRef} className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden">
            <button 
              onClick={closeTrailer}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
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
                
                {movie.runtime && movie.runtime > 0 && (
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
                {trailerKey && (
                  <button 
                    onClick={handleTrailerClick}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors"
                  >
                    <PlayCircle size={20} />
                    <span className="hidden sm:inline">Watch Trailer</span>
                    <span className="sm:hidden">Trailer</span>
                  </button>
                )}
                
                <button 
                  onClick={toggleWatchlist}
                  className={`flex items-center gap-2 ${inWatchlist ? 'bg-green-600 hover:bg-green-700' : 'bg-white bg-opacity-20 hover:bg-opacity-30'} text-white px-6 py-3 rounded-md transition-colors`}
                >
                  <Bookmark size={20} />
                  <span className="hidden sm:inline">{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                  <span className="sm:hidden">{inWatchlist ? 'Saved' : 'Save'}</span>
                </button>
                
                <button 
                  onClick={toggleFavorite}
                  className={`flex items-center gap-2 ${isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-white bg-opacity-20 hover:bg-opacity-30'} text-white px-6 py-3 rounded-md transition-colors`}
                >
                  <Heart size={20} className={isFavorite ? 'fill-white' : ''} />
                  <span className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>
                
                <div className="relative">
                  <button 
                    onClick={handleShareClick}
                    className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-md transition-colors"
                  >
                    <Share2 size={20} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  
                  {showShareOptions && (
                    <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-md shadow-lg p-3 z-30">
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setShowShareOptions(false);
                          }}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors text-left"
                        >
                          Copy Link
                        </button>
                        <a 
                          href={`https://twitter.com/intent/tweet?text=Check out ${movie.title}&url=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors text-left"
                        >
                          Share on Twitter
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Additional Details */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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

export default MovieDetailsPage;