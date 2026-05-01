import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";

interface User {
  fullName: string;
  email: string;
  userType: "individual" | "company";
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (userData: User & { password: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem("ecopneu_currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("ecopneu_currentUser");
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Buscar usuários registrados
    const users = JSON.parse(localStorage.getItem("ecopneu_users") || "[]");
    const foundUser = users.find(
      (u: User & { password: string }) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("ecopneu_currentUser", JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const register = (userData: User & { password: string }) => {
    // Salvar novo usuário
    const users = JSON.parse(localStorage.getItem("ecopneu_users") || "[]");

    // Verificar se email já existe
    const emailExists = users.some((u: User & { password: string }) => u.email === userData.email);
    if (emailExists) {
      return;
    }

    users.push(userData);
    localStorage.setItem("ecopneu_users", JSON.stringify(users));

    // Fazer login automático após registro
    const { password: _, ...userWithoutPassword } = userData;
    setUser(userWithoutPassword);
    localStorage.setItem("ecopneu_currentUser", JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    console.log("🚪 Fazendo logout...");
    setUser(null);
    localStorage.removeItem("ecopneu_currentUser");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
