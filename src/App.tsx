import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Navbar } from "./components/Navbar";



function App() {
  return (
    <Router>

      <Navbar />
      <Sidebar />
        
       
        
        
          <Routes>
           
            <Route path="/products" />
            <Route path="/carts"  />
            <Route path="/users"/>
            <Route path="/auth"/>
            
          </Routes>
       
    
    </Router>
  );
}

export default App;
