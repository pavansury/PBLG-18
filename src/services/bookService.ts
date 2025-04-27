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
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching popular books:', error);
    throw new Error('Failed to fetch popular books');
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
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error searching books:', error);
    throw new Error('Failed to search books');
  }
};

// Get book details
export const getBookDetails = async (id: string): Promise<Book> => {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_API_URL}/${id}`, {
      params: {
        key: GOOGLE_BOOKS_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw new Error('Failed to fetch book details');
  }
};

// Get book recommendations (by category and author)
export const getBookRecommendations = async (category: string, author: string): Promise<Book[]> => {
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
    
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults: 10,
        key: GOOGLE_BOOKS_API_KEY
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching book recommendations:', error);
    throw new Error('Failed to fetch book recommendations');
  }
};

// Get books by category
export const getBooksByCategory = async (category: string): Promise<Book[]> => {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: `subject:${category}`,
        maxResults: 20,
        key: GOOGLE_BOOKS_API_KEY
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching books by category:', error);
    throw new Error('Failed to fetch books by category');
  }
};