import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { SiteProvider } from './contexts/SiteContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteProvider>
          <ProductProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </ProductProvider>
        </SiteProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
