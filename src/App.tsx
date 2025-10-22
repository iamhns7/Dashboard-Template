import { BrowserRouter as Router } from "react-router-dom";
import AppNavigation from "./navigation/AppNavigation";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppNavigation />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
