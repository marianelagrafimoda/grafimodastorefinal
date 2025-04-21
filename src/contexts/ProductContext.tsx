
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { uploadImage } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

export interface Size {
  id: string;
  name: string;
  available: boolean;
  isChildSize?: boolean;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  sizes: Size[];
  colors: Color[];
  stockQuantity: number;
  cardColor?: string;
  // Add properties for color management in the Admin interface
  newColorName?: string;
  newColorHex?: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de un ProductProvider');
  }
  return context;
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: crypto.randomUUID(),
    title: 'Camiseta Personalizada',
    description: 'Camiseta de algodón premium lista para personalizar con tu diseño favorito',
    price: 15.99,
    imageUrl: '/placeholder.svg',
    images: ['/placeholder.svg'],
    cardColor: '#C8B6E2',
    stockQuantity: 25,
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
      { id: 'black', name: 'Negro', hex: '#000000' },
      { id: 'blue', name: 'Azul', hex: '#0EA5E9' }
    ],
    sizes: [
      { id: 's', name: 'S', available: true, isChildSize: false },
      { id: 'm', name: 'M', available: true, isChildSize: false },
      { id: 'l', name: 'L', available: true, isChildSize: false },
      { id: 'xl', name: 'XL', available: false, isChildSize: false },
      { id: 'child-s', name: 'S (Niño)', available: true, isChildSize: true },
      { id: 'child-m', name: 'M (Niño)', available: true, isChildSize: true },
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Sudadera con Capucha',
    description: 'Sudadera cómoda y cálida, perfecta para estampados y bordados personalizados',
    price: 29.99,
    imageUrl: '/placeholder.svg',
    cardColor: '#E6DEFF',
    stockQuantity: 15,
    colors: [
      { id: 'gray', name: 'Gris', hex: '#888888' },
      { id: 'black', name: 'Negro', hex: '#000000' }
    ],
    sizes: [
      { id: 's', name: 'S', available: false, isChildSize: false },
      { id: 'm', name: 'M', available: true, isChildSize: false },
      { id: 'l', name: 'L', available: true, isChildSize: false },
      { id: 'xl', name: 'XL', available: true, isChildSize: false },
      { id: 'child-s', name: 'S (Niño)', available: true, isChildSize: true },
      { id: 'child-m', name: 'M (Niño)', available: true, isChildSize: true },
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Gorra Personalizada',
    description: 'Gorra de alta calidad para personalizar con tu logo o diseño preferido',
    price: 12.99,
    imageUrl: '/placeholder.svg',
    cardColor: '#A78BDA',
    stockQuantity: 30,
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
      { id: 'red', name: 'Rojo', hex: '#EF4444' }
    ],
    sizes: [
      { id: 'uni', name: 'Única', available: true, isChildSize: false },
      { id: 'child-uni', name: 'Única (Niño)', available: true, isChildSize: true },
    ]
  }
];

const productToSupabase = (product: Omit<Product, 'id'> & { id?: string }) => {
  const productId = product.id || crypto.randomUUID();
  
  return {
    id: productId,
    title: product.title,
    description: product.description || '',
    price: product.price,
    image_url: product.imageUrl || '/placeholder.svg',
    images: JSON.stringify(product.images || [product.imageUrl || '/placeholder.svg']),
    sizes: JSON.stringify(product.sizes),
    colors: JSON.stringify(product.colors),
    stock_quantity: product.stockQuantity,
    card_color: product.cardColor || '#C8B6E2'
  };
};

const partialProductToSupabase = (product: Partial<Product> & { id?: string }) => {
  const result: Record<string, any> = {};
  
  if (product.id !== undefined) result.id = product.id;
  if (product.title !== undefined) result.title = product.title;
  if (product.description !== undefined) result.description = product.description;
  if (product.price !== undefined) result.price = product.price;
  if (product.imageUrl !== undefined) result.image_url = product.imageUrl;
  if (product.images !== undefined) result.images = JSON.stringify(product.images);
  if (product.sizes !== undefined) result.sizes = JSON.stringify(product.sizes);
  if (product.colors !== undefined) result.colors = JSON.stringify(product.colors);
  if (product.stockQuantity !== undefined) result.stock_quantity = product.stockQuantity;
  if (product.cardColor !== undefined) result.card_color = product.cardColor;
  
  return result;
};

const supabaseToProduct = (data: any): Product => {
  let sizes = data.sizes;
  let colors = data.colors;
  let images = data.images;
  
  if (typeof sizes === 'string') {
    try {
      sizes = JSON.parse(sizes);
    } catch (e) {
      sizes = [];
    }
  }
  
  if (typeof colors === 'string') {
    try {
      colors = JSON.parse(colors);
    } catch (e) {
      colors = [];
    }
  }
  
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = data.image_url ? [data.image_url] : ['/placeholder.svg'];
    }
  } else if (!images) {
    images = data.image_url ? [data.image_url] : ['/placeholder.svg'];
  }
  
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    price: data.price,
    imageUrl: data.image_url || '/placeholder.svg',
    images: images,
    sizes: sizes || [],
    colors: colors || [],
    stockQuantity: data.stock_quantity || 0,
    cardColor: data.card_color || '#C8B6E2'
  };
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const formattedProducts = data.map(supabaseToProduct);
        setProducts(formattedProducts);
      } else {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          setProducts(DEFAULT_PRODUCTS);
          localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
          
          if (isAdmin) {
            try {
              for (const product of DEFAULT_PRODUCTS) {
                await supabase
                  .from('products')
                  .insert(productToSupabase(product));
              }
              console.log('Seeded default products to Supabase');
            } catch (seedError) {
              console.error('Failed to seed default products:', seedError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch products from Supabase:', error);
      
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(DEFAULT_PRODUCTS);
        localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [isAdmin]);

  useEffect(() => {
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, (payload) => {
        console.log('Realtime update:', payload);
        fetchProducts();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      return await uploadImage(file, 'product_images', 'products/');
    } catch (error) {
      console.error('Error uploading product image:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo cargar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'> & { id?: string }) => {
    try {
      if (!user) {
        toast({
          title: "Acceso denegado",
          description: "Debe iniciar sesión como administrador para añadir productos.",
          variant: "destructive",
        });
        return;
      }

      const newProductId = product.id || crypto.randomUUID();
      
      const newProduct = {
        ...product,
        id: newProductId,
        description: product.description || '',
        imageUrl: product.imageUrl || '/placeholder.svg',
        cardColor: product.cardColor || '#C8B6E2'
      };
      
      const newProductAsProduct = newProduct as Product;
      
      const supabaseData = productToSupabase(newProduct);
      
      const { error } = await supabase
        .from('products')
        .insert(supabaseData);
      
      if (error) {
        console.error('Error adding product to Supabase:', error);
        
        if (error.message.includes('violates row-level security policy')) {
          toast({
            title: "Error de permisos",
            description: "Su sesión no tiene permisos de administrador. Por favor, cierre sesión y vuelva a iniciar sesión.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
        
        toast({
          title: "Error al añadir producto",
          description: error.message,
          variant: "destructive",
        });
        
        const updatedProducts = [...products, newProductAsProduct];
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return;
      }
      
      const updatedProducts = [...products, newProductAsProduct];
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      toast({
        title: "Producto añadido",
        description: "El producto ha sido añadido correctamente.",
      });
    } catch (error) {
      console.error('Failed to add product:', error);
      
      toast({
        title: "Error al añadir producto",
        description: "Ocurrió un error inesperado. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      if (!user) {
        toast({
          title: "Acceso denegado",
          description: "Debe iniciar sesión como administrador para modificar productos.",
          variant: "destructive",
        });
        return;
      }

      const updatedProducts = products.map(product => 
        product.id === id ? { 
          ...product, 
          ...updates,
          description: updates.description ?? product.description ?? '',
          imageUrl: updates.imageUrl ?? product.imageUrl ?? '/placeholder.svg',
          cardColor: updates.cardColor ?? product.cardColor ?? '#C8B6E2'
        } : product
      );
      
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      const supabaseData = partialProductToSupabase({ id, ...updates });
      delete supabaseData.id;
      
      const { error } = await supabase
        .from('products')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating product in Supabase:', error);
        
        if (error.message.includes('violates row-level security policy')) {
          toast({
            title: "Error de permisos",
            description: "Su sesión no tiene permisos de administrador. Por favor, cierre sesión y vuelva a iniciar sesión.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
        
        toast({
          title: "Error al actualizar producto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error('Failed to update product:', error);
      
      toast({
        title: "Error al actualizar producto",
        description: "Ocurrió un error inesperado. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const removeProduct = async (id: string) => {
    try {
      if (!user) {
        toast({
          title: "Acceso denegado",
          description: "Debe iniciar sesión como administrador para eliminar productos.",
          variant: "destructive",
        });
        return;
      }

      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing product from Supabase:', error);
        
        if (error.message.includes('violates row-level security policy')) {
          toast({
            title: "Error de permisos",
            description: "Su sesión no tiene permisos de administrador. Por favor, cierre sesión y vuelva a iniciar sesión.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
        
        toast({
          title: "Error al eliminar producto",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      });
    } catch (error) {
      console.error('Failed to remove product:', error);
      
      toast({
        title: "Error al eliminar producto",
        description: "Ocurrió un error inesperado. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      removeProduct,
      uploadProductImage,
      isLoading
    }}>
      {children}
    </ProductContext.Provider>
  );
};
