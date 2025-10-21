import { BrowserRouter as Router } from "react-router-dom";
import AppNavigation from "./navigation/AppNavigation";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </Router>
  );
}

export default App;
