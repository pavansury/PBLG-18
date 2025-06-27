// Import Indian languages from shared language types
import type { IndianLanguage } from './language';
import { INDIAN_LANGUAGES } from './language';

export type { IndianLanguage };
export { INDIAN_LANGUAGES };

export interface Book {
  id: string;
  volumeInfo?: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    language?: IndianLanguage | string; // Primarily Indian language codes
    language_details?: {
      name: string;
      code: string;
    };
    previewLink?: string;
    infoLink?: string;
    printType?: string;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}