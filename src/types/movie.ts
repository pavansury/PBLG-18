import type { IndianLanguage } from './language';
import { INDIAN_LANGUAGES } from './language';

export type { IndianLanguage };
export { INDIAN_LANGUAGES };

export interface Movie {
  id: string;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  runtime?: number;
  genres?: {
    id: number;
    name: string;
  }[];
  popularity: number;
  tagline?: string;
  original_language?: IndianLanguage | string; // Primarily Indian language codes
  status?: string;
  language_details?: {
    name: string;
    code: string;
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
}