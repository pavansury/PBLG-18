// React is used implicitly by JSX
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import IndianCinemaPage from './pages/IndianCinemaPage';
import IndianLiteraturePage from './pages/IndianLiteraturePage';

// Create a future flags configuration for React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// AnimatePresence wrapper component that uses location for key
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailsPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="/indian-cinema" element={<IndianCinemaPage />} />
        <Route path="/indian-literature" element={<IndianLiteraturePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <RecommendationProvider>
      <Router future={router.future}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </RecommendationProvider>
  );
}

export default App;