import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import Auth from '../pages/Auth';
import { RootState } from '../redux/store';

interface AuthModelProps {
  onClose: () => void;
}

function AuthModel({ onClose }: AuthModelProps) {
  const { userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (userData) {
      onClose();
    }
  }, [userData, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-7 right-6 z-20 text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <FaTimes size={16} />
        </button>
        <Auth isModel={true} />
      </div>
    </div>
  );
}

export default AuthModel;
