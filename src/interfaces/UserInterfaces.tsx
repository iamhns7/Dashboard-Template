 export default interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}