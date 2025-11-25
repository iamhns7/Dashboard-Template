import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import useAuthValidation from "../utils/validation/Validation";
import { useAuth } from "../utils/hooks/useAuth";
import { useTranslation } from 'react-i18next';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, i18n } = useTranslation();

  const { values, setField, errors, validateAll } = useAuthValidation();
  const [submitError, setSubmitError] = useState("");

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

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
      setSubmitError(t('auth.loginError'));
    }
  };

  return (
  <div className="d-flex justify-content-center align-items-center py-5 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "1rem" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">{t('auth.login')}</h3>
          <div className="btn-group btn-group-sm">
            <button 
              className={`btn ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>
            <button 
              className={`btn ${i18n.language === 'tr' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => changeLanguage('tr')}
            >
              TR
            </button>
          </div>
        </div>

        {submitError && <div className="alert alert-danger text-center py-2">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              {t('auth.username')}
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
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder={t('auth.password')}
              value={values.password}
              onChange={(e) => setField("password", e.target.value)}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            {t('auth.loginButton')}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Auth;
