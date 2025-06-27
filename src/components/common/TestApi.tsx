import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TMDB_API_KEY = 'a2d5b9e3da10dad4af724bfccab52310';
const TMDB_URL = 'https://api.themoviedb.org/3/movie/popular';

const GOOGLE_BOOKS_API_KEY = 'AIzaSyAqOg-25YOaaa8kpZzELMIWTlj-P5odmRw';
const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';

const TestApi = () => {
  const [tmdbStatus, setTmdbStatus] = useState<string>('Testing...');
  const [googleBooksStatus, setGoogleBooksStatus] = useState<string>('Testing...');
  const [tmdbData, setTmdbData] = useState<any>(null);
  const [googleBooksData, setGoogleBooksData] = useState<any>(null);

  useEffect(() => {
    // Test TMDB API
    const testTmdb = async () => {
      try {
        const response = await axios.get(TMDB_URL, {
          params: {
            api_key: TMDB_API_KEY,
            language: 'en-US',
            page: 1
          }
        });
        setTmdbStatus('✅ Connected successfully');
        setTmdbData({
          totalResults: response.data.total_results,
          results: response.data.results.length
        });
      } catch (error: any) {
        setTmdbStatus(`❌ Error: ${error.message}`);
        if (error.response) {
          setTmdbStatus(`❌ Error: ${error.response.status} - ${error.response.data?.status_message || 'Unknown error'}`);
        } else if (error.request) {
          setTmdbStatus('❌ No response received from server');
        }
      }
    };

    // Test Google Books API
    const testGoogleBooks = async () => {
      try {
        const response = await axios.get(GOOGLE_BOOKS_URL, {
          params: {
            q: 'subject:fiction',
            maxResults: 1,
            key: GOOGLE_BOOKS_API_KEY
          }
        });
        setGoogleBooksStatus('✅ Connected successfully');
        setGoogleBooksData({
          totalItems: response.data.totalItems,
          items: response.data.items?.length || 0
        });
      } catch (error: any) {
        setGoogleBooksStatus(`❌ Error: ${error.message}`);
        if (error.response) {
          setGoogleBooksStatus(`❌ Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
        } else if (error.request) {
          setGoogleBooksStatus('❌ No response received from server');
        }
      }
    };

    testTmdb();
    testGoogleBooks();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">TMDB API</h2>
          <p className="mb-2">Status: {tmdbStatus}</p>
          {tmdbData && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(tmdbData, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Google Books API</h2>
          <p className="mb-2">Status: {googleBooksStatus}</p>
          {googleBooksData && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(googleBooksData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestApi;
