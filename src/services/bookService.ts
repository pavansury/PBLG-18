import axios from 'axios';
import { Book } from '../types/book';

const GOOGLE_BOOKS_API_KEY = 'AIzaSyAqOg-25YOaaa8kpZzELMIWTlj-P5odmRw';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Get popular books
export const getPopularBooks = async (): Promise<Book[]> => {
  try {
    // Since Google Books API doesn't have a direct "popular" endpoint,
    // we'll use a combination of bestsellers and high ratings
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: 'subject:fiction',
        orderBy: 'relevance',
        maxResults: 20,
        key: GOOGLE_BOOKS_API_KEY
      }
    });
    
    // Google Books API returns an empty array if no items found, which is valid
    return response.data.items || [];
  } catch (error: any) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          console.error('API key is invalid or expired');
          throw new Error('API key is invalid or expired');
        } else {
          console.error(`Google Books API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
          throw new Error(`Google Books API error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received from Google Books API:', error.request);
        throw new Error('No response received from Google Books API. Please check your internet connection.');
      } else {
        console.error('Error setting up the request:', error.message);
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    } else {
      console.error('Error fetching popular books:', error);
      throw new Error('Failed to fetch popular books');
    }
  }
};

// Search for books
export const searchBooks = async (query: string): Promise<Book[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults: 20,
        key: GOOGLE_BOOKS_API_KEY
      }
    });
    
    // Google Books API returns an empty array if no items found, which is valid
    return response.data.items || [];
  } catch (error: any) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          console.error('API key is invalid or expired');
          throw new Error('API key is invalid or expired');
        } else {
          console.error(`Google Books API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
          throw new Error(`Google Books API error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received from Google Books API:', error.request);
        throw new Error('No response received from Google Books API. Please check your internet connection.');
      } else {
        console.error('Error setting up the request:', error.message);
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    } else {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books');
    }
  }
};

// Get book details
export const getBookDetails = async (id: string): Promise<Book> => {
  try {
    // Validate the book ID
    if (!id) {
      throw new Error('Book ID is required');
    }

    const response = await axios.get(`${GOOGLE_BOOKS_API_URL}/${id}`, {
      params: {
        key: GOOGLE_BOOKS_API_KEY
      }
    });
    
    // Check if we got a valid response
    if (!response.data) {
      throw new Error('No data received from Google Books API');
    }
    
    return response.data;
  } catch (error: any) {
    // Handle specific axios errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(`Book with ID ${id} not found`);
          throw new Error(`Book with ID ${id} not found`);
        } else if (error.response.status === 401 || error.response.status === 403) {
          console.error('API key is invalid or expired');
          throw new Error('API key is invalid or expired');
        } else {
          console.error(`Google Books API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
          throw new Error(`Google Books API error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('No response received from Google Books API:', error.request);
        throw new Error('No response received from Google Books API. Please check your internet connection.');
      } else {
        console.error('Error setting up the request:', error.message);
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    } else {
      console.error('Error fetching book details:', error);
      throw new Error('Failed to fetch book details');
    }
  }
};

// Get book recommendations (by category and author)
export const getBookRecommendations = async (category: string, author: string): Promise<Book[]> => {
  // Number of retry attempts
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any = null;

  // Retry logic with exponential backoff
  while (retryCount <= maxRetries) {
    try {
      // If we have a category, prioritize that. Otherwise, use the author.
      let query = category ? `subject:${category}` : '';
      
      if (author && !query) {
        query = `inauthor:${author}`;
      } else if (author) {
        // Add author as a secondary filter if we already have a category
        query += ` inauthor:${author}`;
      }
      
      // Fallback if we don't have either
      if (!query) {
        query = 'subject:fiction';
      }

      // Set a timeout for the request to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await axios.get(GOOGLE_BOOKS_API_URL, {
          params: {
            q: query,
            maxResults: 6, // Reduced from 10 to help with rate limiting
            key: GOOGLE_BOOKS_API_KEY
          },
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
        
        // Google Books API returns an empty array if no items found, which is valid
        return response.data.items || [];
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
          if (error.response.status === 401 || error.response.status === 403) {
            console.error('API key is invalid or expired');
            throw new Error('API key is invalid or expired');
          } else if (error.response.status === 429) {
            // Rate limiting - wait and retry with exponential backoff
            const waitTime = 1000 * Math.pow(2, retryCount); // Exponential backoff: 1s, 2s, 4s, etc.
            console.warn(`Rate limited by Google Books API. Retrying in ${waitTime/1000}s... (${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retryCount++;
            continue; // Try again
          } else {
            console.error(`Google Books API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
            throw new Error(`Google Books API error: ${error.response.status}`);
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
            console.error('No response received from Google Books API after multiple attempts');
            throw new Error('No response received from Google Books API. Please check your internet connection.');
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up the request:', error.message);
          throw new Error(`Error setting up the request: ${error.message}`);
        }
      } else {
        console.error('Error fetching book recommendations:', error);
        throw new Error('Failed to fetch book recommendations');
      }
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Failed to fetch book recommendations after multiple attempts');
};

// Get books by category
export const getBooksByCategory = async (category: string): Promise<Book[]> => {
  // Number of retry attempts
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any = null;

  // Retry logic with exponential backoff
  while (retryCount <= maxRetries) {
    try {
      // Validate the category
      if (!category) {
        throw new Error('Category is required');
      }
      
      // Set a timeout for the request to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await axios.get(GOOGLE_BOOKS_API_URL, {
          params: {
            q: `subject:${category}`,
            maxResults: 12, // Reduced from 20 to help with rate limiting
            key: GOOGLE_BOOKS_API_KEY
          },
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
        
        // Google Books API returns an empty array if no items found, which is valid
        return response.data.items || [];
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
          if (error.response.status === 401 || error.response.status === 403) {
            console.error('API key is invalid or expired');
            throw new Error('API key is invalid or expired');
          } else if (error.response.status === 429) {
            // Rate limiting - wait and retry with exponential backoff
            const waitTime = 1000 * Math.pow(2, retryCount); // Exponential backoff: 1s, 2s, 4s, etc.
            console.warn(`Rate limited by Google Books API. Retrying in ${waitTime/1000}s... (${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retryCount++;
            continue; // Try again
          } else {
            console.error(`Google Books API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
            throw new Error(`Google Books API error: ${error.response.status}`);
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
            console.error('No response received from Google Books API after multiple attempts');
            throw new Error('No response received from Google Books API. Please check your internet connection.');
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up the request:', error.message);
          throw new Error(`Error setting up the request: ${error.message}`);
        }
      } else {
        console.error('Error fetching books by category:', error);
        throw new Error('Failed to fetch books by category');
      }
    }
  }
  
  // If we've exhausted all retries
  throw lastError || new Error('Failed to fetch books by category after multiple attempts');
};