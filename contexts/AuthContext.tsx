import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { setCookie, parseCookies, destroyCookie } from "nookies";

type SignInCredentials = {
  email: string;
  password: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User | null;
};
type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export const signOut = () => {
  destroyCookie(undefined, "nextAuthToken");
  destroyCookie(undefined, "nextAuthRefreshToken");

  authChannel.postMessage("signOut");

  typeof window !== "undefined" && Router.push("/");
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          break;
        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { nextAuthToken: token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, permissions, roles, refreshToken } = response.data;

      setCookie(undefined, "nextAuthToken", token, {
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: "/",
      });
      setCookie(undefined, "nextAuthRefreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      Router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
