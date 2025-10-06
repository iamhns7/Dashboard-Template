import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



function App() {
  return (
      <Router>

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
