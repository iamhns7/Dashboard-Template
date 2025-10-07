import Navbar from "../components/Navbar";  
import Sidebar from "../components/Sidebar";
import Products from "../pages/Products";



const DashboardLayout = () => {
  return (
    <>
      
      <Navbar/>  
      <Sidebar darkMode={false}/>
      <Products />
      
      
     
    </>
  );
};
export default DashboardLayout