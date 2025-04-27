import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import BooksPage from './pages/BooksPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import BookDetailsPage from './pages/BookDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import { RecommendationProvider } from './context/RecommendationContext';

function App() {
  return (
    <RecommendationProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetailsPage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </Router>
    </RecommendationProvider>
  );
}

export default App;