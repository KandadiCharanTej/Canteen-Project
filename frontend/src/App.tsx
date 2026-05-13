import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { Providers } from './context/Providers';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Providers>
        <AppRoutes />
        <Toaster position="top-center" expand={false} richColors />
      </Providers>
    </Router>
  );
}

export default App;

