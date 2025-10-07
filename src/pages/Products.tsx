
const Products = () => {
  return (
    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          {/* Start page title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box">
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <a href="#">Powerx</a>
                    </li>
                    <li className="breadcrumb-item active">Introduction</li>
                  </ol>
                </div>
                <h4 className="page-title">Introduction</h4>
              </div>
            </div>
          </div>

       

 
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              © Powerx - <a href="https://coderthemes.com/" target="_blank">Coderthemes.com</a>
            </div>
            <div className="col-md-6">
              <div className="text-md-end footer-links d-none d-md-block">
                <a href="#">About</a>
                <a href="#">Support</a>
                <a href="#">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Products;
