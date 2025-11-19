import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', fullScreen = true }) => {
  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-white dark:bg-gray-900'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
