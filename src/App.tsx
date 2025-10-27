import { BrowserRouter as Router } from "react-router-dom";
import AppNavigation from "./utils/navigation/AppNavigation";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/query/client';

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <AppNavigation />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
