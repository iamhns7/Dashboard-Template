import { createContext } from "react";
import type { ThemeContextType } from "../interfaces/ThemeContextInterfaces";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
