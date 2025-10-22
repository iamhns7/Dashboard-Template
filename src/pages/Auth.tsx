import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import useAuthValidation from "../validation/Validation";
import { useAuth } from "../hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { values, setField, errors, validateAll } = useAuthValidation();
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const ok = validateAll();
    if (!ok) return;

    // gerçek projede burada server-side auth çağrısı olmalı
    if (values.email === "iamhns7@gamil.com" && values.password === "iamhns7") {
      // Login başarılı
      login();
      navigate("/dashboard");
    } else {
      setSubmitError("Incorrect Email or Password!");
    }
  };

  return (
  <div className="d-flex justify-content-center align-items-center py-5 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "1rem" }}>
        <h3 className="text-center mb-4 fw-bold">Admin Login</h3>

        {submitError && <div className="alert alert-danger text-center py-2">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="example@mail.com"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="Password"
              value={values.password}
              onChange={(e) => setField("password", e.target.value)}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            Login
          </button>
        </form>

      </div>
    </div>
  );
};

export default Auth;
