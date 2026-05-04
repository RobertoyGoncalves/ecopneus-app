import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";

export interface User {
  fullName: string;
  email: string;
  userType: "individual" | "company";
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  /** Definido quando a sessão veio do Supabase (auth.users.id). */
  supabaseUserId: string | null;
  /** Evita flash de rota protegida antes de hidratar sessão Supabase. */
  authReady: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: User & { password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(
  sbUser: SupabaseUser,
  profile: { full_name: string | null; user_type: string | null; company_name: string | null } | null
): User {
  const meta = (sbUser.user_metadata ?? {}) as Record<string, string | undefined>;
  const userType: User["userType"] =
    profile?.user_type === "company" || meta.user_type === "company" ? "company" : "individual";
  return {
    email: sbUser.email ?? "",
    fullName: profile?.full_name || meta.full_name || "",
    userType,
    companyName: profile?.company_name || meta.company_name || undefined,
  };
}

async function hydrateFromSupabaseSession(session: Session | null): Promise<{ user: User | null; supabaseUserId: string | null }> {
  if (!session?.user) {
    return { user: null, supabaseUserId: null };
  }
  const supabase = getSupabase();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, user_type, company_name")
    .eq("id", session.user.id)
    .maybeSingle();

  const safeProfile = error ? null : profile;

  return {
    user: mapSupabaseUser(session.user, safeProfile),
    supabaseUserId: session.user.id,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(() => !isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const savedUser = localStorage.getItem("ecopneu_currentUser");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("ecopneu_currentUser");
        }
      }
      setAuthReady(true);
      return;
    }

    const supabase = getSupabase();

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void (async () => {
        const h = await hydrateFromSupabaseSession(session);
        setUser(h.user);
        setSupabaseUserId(h.supabaseUserId);
        setAuthReady(true);
      })();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        const h = await hydrateFromSupabaseSession(session);
        setUser(h.user);
        setSupabaseUserId(h.supabaseUserId);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      const users = JSON.parse(localStorage.getItem("ecopneu_users") || "[]");
      const foundUser = users.find(
        (u: User & { password: string }) => u.email === email && u.password === password
      );
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setSupabaseUserId(null);
        localStorage.setItem("ecopneu_currentUser", JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    }

    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) return false;
    return true;
  }, []);

  const register = useCallback(
    async (userData: User & { password: string }): Promise<{ ok: boolean; error?: string }> => {
      if (!isSupabaseConfigured()) {
        const users = JSON.parse(localStorage.getItem("ecopneu_users") || "[]");
        const emailExists = users.some((u: User & { password: string }) => u.email === userData.email);
        if (emailExists) {
          return { ok: false, error: "E-mail já cadastrado." };
        }
        users.push(userData);
        localStorage.setItem("ecopneu_users", JSON.stringify(users));
        const { password: _, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
        setSupabaseUserId(null);
        localStorage.setItem("ecopneu_currentUser", JSON.stringify(userWithoutPassword));
        return { ok: true };
      }

      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            user_type: userData.userType,
            company_name: userData.companyName,
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      // Perfil em `profiles`: trigger no Postgres (migration 002), não upsert aqui — evita RLS sem sessão.

      if (!data.session) {
        return {
          ok: true,
          error:
            "Conta criada. Se o e-mail de confirmação estiver ativo no Supabase, confirme o e-mail antes de entrar.",
        };
      }

      return { ok: true };
    },
    []
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await getSupabase().auth.signOut();
    }
    setUser(null);
    setSupabaseUserId(null);
    localStorage.removeItem("ecopneu_currentUser");
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUserId,
        authReady,
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
