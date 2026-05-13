import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-black text-primary mb-4">404</h1>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <button 
        onClick={() => navigate('/')}
        className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-transform"
      >
        Go Home
      </button>
    </div>
  );
}

