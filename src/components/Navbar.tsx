import logo from "../assets/stp.jpeg"; 

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
       
        <div className="navbar-brand d-flex align-items-center">
           <img src={logo} alt="MyStore Logo" className="logo me-2" />
            PAZAR
     </div>
      </div>
    </nav>
  );
};
