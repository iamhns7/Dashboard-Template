import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";



function App() {
  return (
      <Router>
        <DashboardLayout/>

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
