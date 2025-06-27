import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  name?: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const str = localStorage.getItem('authCurrent');
    if (str) {
      setUser(JSON.parse(str));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Profile</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Name:</strong> {user.name || 'Anonymous'}</p>
        <p className="text-gray-700 dark:text-gray-300 mb-6"><strong>Email:</strong> {user.email}</p>
        <button
          onClick={() => {
            localStorage.removeItem('authCurrent');
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
