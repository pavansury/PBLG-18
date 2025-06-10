import axios from 'axios';

// API keys and base URLs
const TMDB_API_KEY = 'a2d5b9e3da10dad4af724bfccab52310';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAqOg-25YOaaa8kpZzELMIWTlj-P5odmRw';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// For TMDB API (movies)
export const fetchMoviesByLanguage = async (language: string, page = 1) => {
  // Map your language IDs to TMDB language codes
  const languageCodeMap: {[key: string]: string} = {
    hindi: 'hi',
    tamil: 'ta',
    telugu: 'te',
    malayalam: 'ml',
    kannada: 'kn',
    bengali: 'bn',
    marathi: 'mr',
    punjabi: 'pa',
    gujarati: 'gu',
    odia: 'or',
    assamese: 'as',
  };
  
  const languageCode = languageCodeMap[language] || '';
  
  try {
    // If language is 'all', fetch discover/movie, otherwise filter by language
    const endpoint = language === 'all' 
      ? 'discover/movie' 
      : `discover/movie`;
      
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
        with_original_language: language !== 'all' ? languageCode : undefined,
        region: 'IN', // To prioritize Indian content
        sort_by: 'popularity.desc',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by language:', error);
    throw error;
  }
};

// For Google Books API
export const fetchBooksByLanguage = async (language: string, page = 1) => {
  // Map your language IDs to ISO language codes for Google Books API
  const languageCodeMap: {[key: string]: string} = {
    hindi: 'hi',
    tamil: 'ta',
    telugu: 'te',
    malayalam: 'ml',
    kannada: 'kn',
    bengali: 'bn',
    marathi: 'mr',
    punjabi: 'pa',
    gujarati: 'gu',
    odia: 'or',
    assamese: 'as',
  };
  
  const languageCode = languageCodeMap[language] || '';
  const startIndex = (page - 1) * 10;
  
  try {
    // Base query parameters
    const params: any = {
      key: GOOGLE_BOOKS_API_KEY,
      startIndex,
      maxResults: 10,
    };
    
    // Add language restriction if not "all"
    if (language !== 'all') {
      params.langRestrict = languageCode;
    }
    
    // Build the query with relevant terms for Indian books
    let query = 'subject:fiction';
    
    // Add country focus for Indian content
    query += '+subject:"Indian"';
    
    // Add language filter in the query if specified
    if (language !== 'all') {
      query += `+inlanguage:${languageCode}`;
    }
    
    const response = await axios.get(`${GOOGLE_BOOKS_API_URL}`, {
      params: {
        ...params,
        q: query,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching books by language:', error);
    throw error;
  }
};

// Additional helper function to get movie details with trailers
export const fetchMovieDetails = async (movieId: string) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'videos,credits,similar',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

// Fetch book details
export const fetchBookDetails = async (bookId: string) => {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_API_URL}/${bookId}`, {
      params: {
        key: GOOGLE_BOOKS_API_KEY,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};