
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface User {
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

const SUPER_ADMIN_EMAIL = 'marianela.grafimoda@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is stored in localStorage first (fallback)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check session with Supabase
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const { email } = data.session.user;
          // Check if admin in a real app, we would use claims or a separate table
          const isAdmin = email === SUPER_ADMIN_EMAIL;
          const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
          const userData = { email, isAdmin, isSuperAdmin };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          console.log('User session restored:', email);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkSession();
    
    // Setup auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { email } = session.user;
          const isAdmin = email === SUPER_ADMIN_EMAIL;
          const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
          const userData = { email, isAdmin, isSuperAdmin };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          toast({
            title: "Sesión iniciada",
            description: `Bienvenido, ${email}`,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
          
          toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión correctamente",
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try Supabase auth first
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase login error:', error.message);
        
        // Fallback to hard-coded admin for development
        if (email === SUPER_ADMIN_EMAIL && password === 'marianelalinda2025') {
          const adminUser = { 
            email, 
            isAdmin: true,
            isSuperAdmin: true 
          };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          
          toast({
            title: "Sesión iniciada",
            description: `Bienvenido, ${email} (modo desarrollo)`,
          });
          
          return true;
        }
        
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to hard-coded admin
      if (email === SUPER_ADMIN_EMAIL && password === 'marianelalinda2025') {
        const adminUser = { 
          email, 
          isAdmin: true,
          isSuperAdmin: true 
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout on client side if Supabase fails
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        isSuperAdmin: user?.isSuperAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
