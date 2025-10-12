import { useState } from "react";
import type { AuthErrors } from "../interfaces/ValidationInterfaces";


export const validateEmail = (email: string): string | undefined => {
  if (!email) return "E-mail is required";
  // kabul edilebilir basit e-posta regex'i
  const re = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) return "Invalid e-mail format";
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length > 7) return "Please enter valide password";
  return undefined;
};

// hook for auth form validation
export const useAuthValidation = (initial = { email: "", password: "" }) => {
  const [values, setValues] = useState<{ email: string; password: string }>(initial);
  const [errors, setErrors] = useState<AuthErrors>({});

  const setField = (field: "email" | "password", value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // canlı doğrulama: hata varsa güncelle
    if (field === "email") setErrors((e) => ({ ...e, email: validateEmail(value) }));
    if (field === "password") setErrors((e) => ({ ...e, password: validatePassword(value) }));
  };

  const validateAll = (): boolean => {
    const emailErr = validateEmail(values.email);
    const passErr = validatePassword(values.password);
    const next: AuthErrors = {};
    if (emailErr) next.email = emailErr;
    if (passErr) next.password = passErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return {
    values,
    setField,
    errors,
    validateAll,
    setErrors,
    setValues,
  } as const;
};

export default useAuthValidation;
