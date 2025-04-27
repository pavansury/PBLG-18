import axios from 'axios';
import { Movie } from '../types/movie';

const TMDB_API_KEY = 'a2d5b9e3da10dad4af724bfccab52310';
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Get popular movies
export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${TMDB_API_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw new Error('Failed to fetch popular movies');
  }
};

// Search for movies
export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await axios.get(`${TMDB_API_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        query,
        page: 1,
        include_adult: false
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new Error('Failed to search movies');
  }
};

// Get movie details
export const getMovieDetails = async (id: string): Promise<Movie> => {
  try {
    const response = await axios.get(`${TMDB_API_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        append_to_response: 'credits,videos'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw new Error('Failed to fetch movie details');
  }
};

// Get movie recommendations
export const getMovieRecommendations = async (id: string): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${TMDB_API_URL}/movie/${id}/recommendations`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw new Error('Failed to fetch movie recommendations');
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId: string): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${TMDB_API_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        with_genres: genreId,
        sort_by: 'popularity.desc',
        page: 1
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw new Error('Failed to fetch movies by genre');
  }
};