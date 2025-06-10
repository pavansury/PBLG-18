// Add to your existing Navigation component

// Import the new pages
import { Film, BookOpen } from 'lucide-react';

// Add these to your navigation links array
const navLinks = [
  // ...existing links
  {
    name: 'Indian Cinema',
    path: '/indian-cinema',
    icon: <Film className="w-5 h-5" />,
  },
  {
    name: 'Indian Literature',
    path: '/indian-literature',
    icon: <BookOpen className="w-5 h-5" />,
  },
];

// Example Navigation component using navLinks
const Navigation = () => (
  <nav>
    <ul>
      {navLinks.map((link) => (
        <li key={link.path}>
          <a href={link.path} className="flex items-center gap-2">
            {link.icon}
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export default Navigation;