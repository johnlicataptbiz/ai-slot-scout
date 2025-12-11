import React from 'react';

export const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-12 h-12 border-4 border-slate-300 border-t-primary-500 rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-400 font-medium">{message}</p>
    </div>
  );
};