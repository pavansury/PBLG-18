import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, ArrowLeft, BookOpen, ListPlus, User, Globe, BookMarked } from 'lucide-react';
import { useRecommendations } from '../context/RecommendationContext';
import { getBookDetails, getBookRecommendations } from '../services/bookService';
import { Book } from '../types/book';
import BookList from '../components/books/BookList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToRecentlyViewed } = useRecommendations();
  
  const [book, setBook] = useState<Book | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const bookData = await getBookDetails(id);
        setBook(bookData);
        
        // Add to recently viewed
        addToRecentlyViewed(bookData, 'book');
        
        // Fetch recommendations based on categories and author
        if (bookData.volumeInfo) {
          const category = bookData.volumeInfo.categories?.[0] || '';
          const author = bookData.volumeInfo.authors?.[0] || '';
          
          const recommendationsData = await getBookRecommendations(category, author);
          setRecommendations(recommendationsData.filter(book => book.id !== id));
        }
      } catch (err) {
        setError('Failed to load book details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [id, addToRecentlyViewed]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !book || !book.volumeInfo) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Book not found.'}
          </p>
          <button
            onClick={handleBackClick}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { volumeInfo } = book;

  return (
    <div className="pt-16 min-h-screen">
      {/* Book Hero Section */}
      <section className="bg-gradient-to-r from-primary-900 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
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
              {volumeInfo.imageLinks ? (
                <img 
                  src={volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail} 
                  alt={volumeInfo.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
                  <BookOpen size={48} className="text-white opacity-50" />
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-grow"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {volumeInfo.title}
              </h1>
              
              {volumeInfo.subtitle && (
                <p className="text-xl text-primary-100 mb-4">{volumeInfo.subtitle}</p>
              )}
              
              {volumeInfo.authors && volumeInfo.authors.length > 0 && (
                <p className="text-lg mb-6">
                  by {volumeInfo.authors.join(', ')}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {volumeInfo.averageRating && (
                  <div className="flex items-center">
                    <Star size={20} className="text-yellow-400 mr-1" />
                    <span>{volumeInfo.averageRating.toFixed(1)}/5</span>
                    {volumeInfo.ratingsCount && (
                      <span className="text-primary-200 ml-1">({volumeInfo.ratingsCount})</span>
                    )}
                  </div>
                )}
                
                {volumeInfo.publishedDate && (
                  <div className="flex items-center">
                    <Calendar size={20} className="mr-1" />
                    <span>{volumeInfo.publishedDate}</span>
                  </div>
                )}
                
                {volumeInfo.pageCount && (
                  <div className="flex items-center">
                    <BookMarked size={20} className="mr-1" />
                    <span>{volumeInfo.pageCount} pages</span>
                  </div>
                )}
              </div>
              
              {volumeInfo.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-primary-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: volumeInfo.description }}></p>
                </div>
              )}
              
              {volumeInfo.categories && volumeInfo.categories.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {volumeInfo.categories.map((category, index) => (
                      <Badge key={index} variant="primary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mt-8">
                {volumeInfo.previewLink && (
                  <a 
                    href={volumeInfo.previewLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md transition-colors"
                  >
                    <BookOpen size={20} />
                    <span>Preview Book</span>
                  </a>
                )}
                
                <button className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-md transition-colors">
                  <ListPlus size={20} />
                  <span>Add to Reading List</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Additional Details */}
      <section className="bg-white dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {volumeInfo.publisher && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Publisher
                </h3>
                <div className="flex items-center">
                  <User size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{volumeInfo.publisher}</span>
                </div>
              </div>
            )}
            
            {volumeInfo.language && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Language
                </h3>
                <div className="flex items-center">
                  <Globe size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {volumeInfo.language.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {volumeInfo.printType && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Print Type
                </h3>
                <div className="flex items-center">
                  <BookOpen size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{volumeInfo.printType}</span>
                </div>
              </div>
            )}
            
            {volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  ISBN
                </h3>
                <div className="flex items-center">
                  <Barcode size={20} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {volumeInfo.industryIdentifiers[0].identifier}
                  </span>
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
            
            <BookList 
              books={recommendations.slice(0, 6)} 
              loading={false}
              error={null}
            />
          </div>
        </section>
      )}
    </div>
  );
};

// Define the missing imports
function Barcode(props: any) {
  return <lucide.Barcode {...props} />;
}

const lucide = {
  Barcode: (props: any) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M3 5v14"></path>
        <path d="M8 5v14"></path>
        <path d="M12 5v14"></path>
        <path d="M17 5v14"></path>
        <path d="M21 5v14"></path>
      </svg>
    );
  }
};

export default BookDetailsPage;