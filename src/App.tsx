import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";



function App() {
  return (
    <Router>
      
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
