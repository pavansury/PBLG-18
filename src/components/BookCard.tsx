import React from 'react';

interface BookCardProps {
  book: {
    id: string;
    volumeInfo?: {
      title: string;
      authors?: string[];
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
    };
    title?: string;
    author?: string;
    coverImage?: string;
    [key: string]: any;
  };
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  // Handle both direct book objects and Google Books API response format
  const title = book.volumeInfo?.title || book.title || 'Unknown Title';
  const authors = book.volumeInfo?.authors || (book.author ? [book.author] : ['Unknown Author']);
  const coverImage = 
    book.volumeInfo?.imageLinks?.thumbnail || 
    book.volumeInfo?.imageLinks?.smallThumbnail || 
    book.coverImage || 
    `https://via.placeholder.com/128x192?text=${encodeURIComponent(title)}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col h-full transition-transform hover:scale-105">
      <div className="relative pt-[140%]">
        <img 
          src={coverImage} 
          alt={`Cover of ${title}`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://via.placeholder.com/128x192?text=${encodeURIComponent(title)}`;
          }}
        />
      </div>
      <div className="p-4 flex-grow">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          {authors.join(', ')}
        </p>
      </div>
    </div>
  );
};

export default BookCard;
