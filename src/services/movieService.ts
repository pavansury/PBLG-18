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
    
    if (!response.data || !response.data.results) {
      throw new Error('Invalid response format from TMDB API');
    }
    
    return response.data.results;
  } catch (error: any) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          console.error('API key is invalid or expired');
          throw new Error('API key is invalid or expired');
        } else {
          console.error(`TMDB API error: ${error.response.status} - ${error.response.data?.status_message || 'Unknown error'}`);
          throw new Error(`TMDB API error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received from TMDB API:', error.request);
        throw new Error('No response received from TMDB API. Please check your internet connection.');
      } else {
        console.error('Error setting up the request:', error.message);
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    } else {
      console.error('Error fetching popular movies:', error);
      throw new Error('Failed to fetch popular movies');
    }
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
    
    if (!response.data || !response.data.results) {
      throw new Error('Invalid response format from TMDB API');
    }
    
    return response.data.results;
  } catch (error: any) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          console.error('API key is invalid or expired');
          throw new Error('API key is invalid or expired');
        } else {
          console.error(`TMDB API error: ${error.response.status} - ${error.response.data?.status_message || 'Unknown error'}`);
          throw new Error(`TMDB API error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received from TMDB API:', error.request);
        throw new Error('No response received from TMDB API. Please check your internet connection.');
      } else {
        console.error('Error setting up the request:', error.message);
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    } else {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
    }
  }
};

// Get movie details with retry mechanism and timeout
export const getMovieDetails = async (id: string): Promise<Movie> => {
  // Number of retry attempts
  const maxRetries = 2;
  let retryCount = 0;
  let lastError: any = null;

  // Retry logic
  while (retryCount <= maxRetries) {
    try {
      // Validate the movie ID
      if (!id) {
        throw new Error('Movie ID is required');
      }

      // Set a timeout for the request to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await axios.get(`${TMDB_API_URL}/movie/${id}`, {
          params: {
            api_key: TMDB_API_KEY,
            language: 'en-US',
            append_to_response: 'credits,videos'
          },
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
        
        // Check if we got a valid response
        if (!response.data) {
          throw new Error('No data received from TMDB API');
        }
        
        // Validate that the response contains the essential movie data
        if (!response.data.id || !response.data.title) {
          throw new Error('Invalid movie data received from TMDB API');
        }
        
        // Return the movie data
        return response.data;
      } catch (err) {
        // Make sure to clear the timeout if there's an error
        clearTimeout(timeoutId);
        throw err; // Re-throw to be caught by the outer try-catch
      }
    } catch (error: any) {
      lastError = error;
      
      // Handle specific axios errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 404) {
            console.error(`Movie with ID ${id} not found`);
            throw new Error(`Movie with ID ${id} not found`);
          } else if (error.response.status === 401) {
            console.error('API key is invalid or expired');
            throw new Error('API key is invalid or expired');
          } else if (error.response.status === 429) {
            // Rate limiting - wait and retry
            console.warn(`Rate limited by TMDB API. Retrying... (${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
            retryCount++;
            continue; // Try again
          } else {
            console.error(`TMDB API error: ${error.response.status} - ${error.response.data?.status_message || 'Unknown error'}`);
            throw new Error(`TMDB API error: ${error.response.status}`);
          }
        } else if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
          // Timeout or abort - retry
          if (retryCount < maxRetries) {
            console.warn(`Request timeout. Retrying... (${retryCount + 1}/${maxRetries + 1})`);
            retryCount++;
            continue; // Try again
          } else {
            console.error('Request timed out after multiple attempts');
            throw new Error('Request timed out. Please try again later.');
          }
        } else if (error.request) {
          // The request was made but no response was received
          if (retryCount < maxRetries) {
            console.warn(`No response received. Retrying... (${retryCount + 1}/${maxRetries + 1})`);
            retryCount++;
            continue; // Try again
          } else {
            console.error('No response received from TMDB API after multiple attempts');
            throw new Error('No response received from TMDB API. Please check your internet connection.');
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up the request:', error.message);
          throw new Error(`Error setting up the request: ${error.message}`);
        }
      } else {
        // Handle non-Axios errors
        console.error('Error fetching movie details:', error);
        throw new Error('Failed to fetch movie details');
      }
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Failed to fetch movie details after multiple attempts');
};

// Get movie recommendations
export const getMovieRecommendations = async (id: string): Promise<Movie[]> => {
  try {
    // Validate the movie ID
    if (!id) {
      throw new Error('Movie ID is required for recommendations');
    }
    
    const response = await axios.get(`${TMDB_API_URL}/movie/${id}/recommendations`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });
    
    if (!response.data || !response.data.results) {
      throw new Error('Invalid response format from TMDB API');
    }
    
    return response.data.results;
  } catch (error: any) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`Movie with ID ${id} not found for recommendations`);
          // Return empty array instead of throwing for recommendations
          return [];
        } else if (error.response.status === 401) {
          console.error('API key is invalid or expired');
          throw new Error('API key is invalid or expired');
        } else {
          console.error(`TMDB API error: ${error.response.status} - ${error.response.data?.status_message || 'Unknown error'}`);
          throw new Error(`TMDB API error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received from TMDB API:', error.request);
        throw new Error('No response received from TMDB API. Please check your internet connection.');
      } else {
        console.error('Error setting up the request:', error.message);
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    } else {
      console.error('Error fetching movie recommendations:', error);
      throw new Error('Failed to fetch movie recommendations');
    }
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId: string): Promise<Movie[]> => {
  try {
    // Validate the genre ID
    if (!genreId) {
      throw new Error('Genre ID is required');
    }
    
    const response = await axios.get(`${TMDB_API_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        with_genres: genreId,
        sort_by: 'popularity.desc',
        page: 1
      }
    });
    
    if (!response.data || !response.data.results) {
      throw new Error('Invalid response format from TMDB API');
    }
    
    return response.data.results;
  } catch (error: any) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          console.error('API key is invalid or expired');
          throw new Error('API key is invalid or expired');
        } else {
          console.error(`TMDB API error: ${error.response.status} - ${error.response.data?.status_message || 'Unknown error'}`);
          throw new Error(`TMDB API error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received from TMDB API:', error.request);
        throw new Error('No response received from TMDB API. Please check your internet connection.');
      } else {
        console.error('Error setting up the request:', error.message);
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    } else {
      console.error('Error fetching movies by genre:', error);
      throw new Error('Failed to fetch movies by genre');
    }
  }
};