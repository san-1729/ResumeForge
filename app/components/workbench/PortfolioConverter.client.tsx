import { useState } from 'react';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';
import { IconButton } from '~/components/ui/IconButton';

interface PortfolioConverterProps {
  onConvert?: () => void;
  className?: string;
}

export const PortfolioConverter = ({ onConvert, className }: PortfolioConverterProps) => {
  const [converting, setConverting] = useState(false);
  
  const handleConvert = () => {
    setConverting(true);
    
    // Display a toast to inform the user
    toast.info('Converting resume to portfolio...', {
      position: 'bottom-right',
      autoClose: 2000,
    });
    
    // Simulate conversion process with a delay
    setTimeout(() => {
      if (onConvert) {
        onConvert();
      }
      setConverting(false);
      
      // Show success message after "conversion"
      toast.success('Resume has been converted to portfolio! Use the prompt to customize further.', {
        position: 'bottom-right',
        autoClose: 4000,
      });
    }, 2000);
  };
  
  return (
    <div className={classNames(
      'flex flex-col items-center bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg p-4 shadow-sm',
      className
    )}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">
          Convert to Digital Portfolio
        </h3>
        <p className="text-sm text-bolt-elements-textSecondary mb-3">
          Transform your resume into an interactive portfolio website
        </p>
        <div className="flex flex-col items-center justify-center bg-gray-800/40 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <div className="i-ph:file-doc text-blue-400 text-2xl mr-2" />
            <div className="text-bolt-elements-textSecondary text-sm">Resume</div>
          </div>
          <div className="h-8 flex items-center justify-center">
            <div className="i-ph:arrow-down-bold animate-bounce text-bolt-elements-textTertiary text-xl" />
          </div>
          <div className="flex items-center">
            <div className="i-ph:globe text-green-400 text-2xl mr-2" />
            <div className="text-bolt-elements-textSecondary text-sm">Portfolio Website</div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-xs">
        <button
          onClick={handleConvert}
          disabled={converting}
          className={classNames(
            'w-full flex items-center justify-center px-4 py-2 rounded-lg transition-all',
            'text-white font-medium',
            converting 
              ? 'bg-blue-500/70 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          )}
        >
          {converting ? (
            <>
              <div className="i-svg-spinners:90-ring-with-bg text-white mr-2 text-lg" />
              <span>Converting...</span>
            </>
          ) : (
            <>
              <div className="i-ph:shuffle text-white mr-2 text-lg" />
              <span>Convert Now</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-bolt-elements-textTertiary">
        Your resume content will be transformed into a professional website layout
      </div>
    </div>
  );
}; 