import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';

interface CardProps {
  id: string;
  type: 'movie' | 'book';
  title: string;
  imageUrl: string;
  rating?: number;
  year?: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  imageUrl, 
  rating, 
  year, 
  onClick 
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="h-full cursor-pointer group"
      onClick={onClick}
      transition={{ duration: 0.2 }}
    >
      <div className="relative h-full rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-[2/3] overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
            </div>
          )}
          
          {rating && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full px-2 py-1 flex items-center space-x-1">
              <Star size={12} className="text-yellow-400" />
              <span className="text-white text-xs font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
          
          {year && (
            <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Clock size={12} className="mr-1" />
              <span>{year}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Card;