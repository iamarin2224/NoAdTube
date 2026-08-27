import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 gap-4">
      <div className="p-5 bg-[#181818] border border-[#272727] rounded-full text-red-500 shadow-xl">
        <Compass className="w-16 h-16" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mt-2">404</h1>
      <h2 className="text-xl font-semibold text-[#f1f1f1]">This page isn't available</h2>
      <p className="text-sm text-[#aaaaaa] max-w-sm">
        The link you followed may be broken, or the page may have been removed.
      </p>
      <Link to="/" className="mt-2">
        <Button variant="youtube" size="md">
          Go to NoAdTube Home
        </Button>
      </Link>
    </div>
  );
};
