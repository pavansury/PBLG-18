import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { Movie } from '../../types/movie';
import { Search } from 'lucide-react';

interface MovieListProps {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  title?: string;
}

const MovieList: React.FC<MovieListProps> = ({ 
  movies, 
  loading, 
  error, 
  title 
}) => {
  const navigate = useNavigate();

  const handleMovieClick = (movieId: string) => {
    navigate(`/movies/${movieId}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Oops! Something went wrong"
        message={error}
        action={
          <button 
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        }
      />
    );
  }

  if (movies.length === 0) {
    return (
      <EmptyState
        title="No movies found"
        message="Try adjusting your search or filters to find what you're looking for."
        icon={<Search size={48} className="text-gray-400" />}
      />
    );
  }

  return (
    <div className="pb-8">
      {title && (
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
      )}
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
      >
        {movies.map((movie) => (
          <motion.div key={movie.id} variants={item}>
            <Card
              id={movie.id}
              type="movie"
              title={movie.title}
              imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''}
              rating={movie.vote_average}
              year={movie.release_date?.substring(0, 4)}
              onClick={() => handleMovieClick(movie.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MovieList;