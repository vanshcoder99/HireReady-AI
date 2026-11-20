import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import Auth from '../pages/Auth';
import { RootState } from '../redux/store';

interface AuthModelProps {
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

function AuthModel({ onClose, initialMode = 'signup' }: AuthModelProps) {
  const { userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (userData) {
      onClose();
    }
  }, [userData, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="relative w-full max-w-md my-auto">
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 z-30 text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-xs"
        >
          <FaTimes size={15} />
        </button>
        <Auth isModel={true} initialMode={initialMode} />
      </div>
    </div>
  );
}

export default AuthModel;
