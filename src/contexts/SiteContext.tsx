import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { saveSiteInfo, uploadImage, getCarouselImages, clearCarouselImages } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { Json } from '../integrations/supabase/types';

interface CustomLink {
  label: string;
  url: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SiteInfo {
  slogan: string;
  whatsappNumber: string;
  instagramLink: string;
  facebookLink: string;
  carouselImages: string[];
  uniqueStyleTitle: string;
  materialsTitle: string;
  materialsDescription: string;
  designTitle: string;
  designDescription: string;
  serviceTitle: string;
  serviceDescription: string;
  faqTitle: string;
  faqItems: FaqItem[];
  footerLogoUrl: string;
  footerAboutText: string;
  footerLinksTitle: string;
  footerContactTitle: string;
  footerCustomLinks: CustomLink[];
  emailAddress: string;
  address: string;
  footerAdditionalInfo: string;
  footerCopyrightText: string;
  productsTitle: string;
  productsSubtitle: string;
  productsDescription: string;
}

interface SiteInfoSupabase {
  carousel_images: Json;
  created_at?: string;
  design_description: string;
  design_title: string;
  facebook_link?: string;
  faq_title: string;
  faq_items?: Json;
  id?: string;
  instagram_link?: string;
  materials_description: string;
  materials_title: string;
  service_description: string;
  service_title: string;
  slogan: string;
  unique_style_title: string;
  updated_at?: string;
  whatsapp_number: string;
  footer_logo_url?: string;
  footer_about_text?: string;
  footer_links_title?: string;
  footer_contact_title?: string;
  footer_custom_links?: Json;
  email_address?: string;
  address?: string;
  footer_additional_info?: string;
  footer_copyright_text?: string;
}

interface SiteContextType {
  siteInfo: SiteInfo;
  updateSiteInfo: (updates: Partial<SiteInfo>) => Promise<void>;
  uploadSiteImage: (file: File) => Promise<string>;
  clearAllImages: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  slogan: "Estilo único, personalizado para ti",
  whatsappNumber: "+593990893095",
  instagramLink: "https://www.instagram.com/",
  facebookLink: "https://www.facebook.com/",
  carouselImages: [],
  uniqueStyleTitle: "¿Quieres un estilo realmente único?",
  materialsTitle: "Materiales Premium",
  materialsDescription: "Utilizamos solo los mejores materiales para asegurar la calidad y durabilidad de nuestros productos.",
  designTitle: "Diseño Personalizado",
  designDescription: "Creamos diseños únicos adaptados a tus preferencias y estilo personal.",
  serviceTitle: "Atención Personalizada",
  serviceDescription: "Te guiamos durante todo el proceso para asegurar que obtengas exactamente lo que deseas.",
  faqTitle: "Todo lo que necesitas saber",
  faqItems: [
    {
      question: "¿Cuánto tiempo tarda en llegar mi pedido personalizado?",
      answer: "El tiempo de entrega varía según la complejidad del diseño y la cantidad de prendas. Generalmente, los pedidos personalizados tardan entre 7 y 14 días hábiles."
    },
    {
      question: "¿Puedo enviar mi propio diseño para personalizarlo?",
      answer: "¡Absolutamente! Puedes enviarnos tu diseño por WhatsApp y trabajaremos juntos para aplicarlo a la prenda que elijas."
    },
    {
      question: "¿Ofrecen descuentos para pedidos al por mayor?",
      answer: "Sí, ofrecemos precios especiales para pedidos de 10 o más prendas. Contáctanos directamente para obtener una cotización personalizada."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos transferencias bancarias, depósitos y efectivo contra entrega. Los detalles de pago se proporcionarán al finalizar tu pedido."
    }
  ],
  footerLogoUrl: "",
  footerAboutText: "",
  footerLinksTitle: "Enlaces Rápidos",
  footerContactTitle: "Contacto",
  footerCustomLinks: [],
  emailAddress: "grafimodastore@gmail.com",
  address: "Guayaquil, Ecuador",
  footerAdditionalInfo: "",
  footerCopyrightText: "",
  productsTitle: "Nuestros Productos",
  productsSubtitle: "Ropa Personalizada",
  productsDescription: "Descubre nuestra selección de prendas de alta calidad listas para ser personalizadas con tu estilo único.",
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const useSiteInfo = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteInfo debe ser usado dentro de un SiteProvider');
  }
  return context;
};

const camelToSnake = (str: string) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const snakeToCamel = (str: string) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const prepareForSupabase = (data: Partial<SiteInfo>): Partial<SiteInfoSupabase> => {
  const result: Partial<SiteInfoSupabase> = {};
  
  Object.keys(data).forEach(key => {
    const snakeKey = camelToSnake(key);
    const value = data[key as keyof Partial<SiteInfo>];
    
    if (key === 'carouselImages') {
      result.carousel_images = value as Json;
    } else if (key === 'footerCustomLinks') {
      result.footer_custom_links = value as Json;
    } else if (key === 'faqItems') {
      result.faq_items = value as Json;
    } else {
      (result as any)[snakeKey] = value;
    }
  });
  
  return result;
};

const prepareFromSupabase = (data: Record<string, any>): Partial<SiteInfo> => {
  const result: Partial<SiteInfo> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      const camelKey = snakeToCamel(key) as keyof SiteInfo;
      
      if (key === 'carousel_images') {
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            result.carouselImages = Array.isArray(parsed) ? parsed.map(String) : [String(value)];
          } catch (e) {
            result.carouselImages = [String(value)];
          }
        } else if (Array.isArray(value)) {
          result.carouselImages = value.map(String);
        } else {
          result.carouselImages = [];
        }
      } else if (key === 'footer_custom_links') {
        try {
          if (typeof value === 'string') {
            result.footerCustomLinks = JSON.parse(value);
          } else if (Array.isArray(value)) {
            result.footerCustomLinks = value;
          } else {
            result.footerCustomLinks = [];
          }
        } catch (e) {
          result.footerCustomLinks = [];
        }
      } else if (key === 'faq_items') {
        try {
          if (typeof value === 'string') {
            result.faqItems = JSON.parse(value);
          } else if (Array.isArray(value)) {
            result.faqItems = value;
          } else {
            result.faqItems = [];
          }
        } catch (e) {
          result.faqItems = DEFAULT_SITE_INFO.faqItems;
        }
      } else {
        result[camelKey] = value;
      }
    }
  });
  
  return result;
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(DEFAULT_SITE_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchSiteInfo = async () => {
    setIsLoading(true);
    try {
      const carouselImages = await getCarouselImages();
      
      const { data, error } = await supabase
        .from('site_info')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching site info:', error);
        throw error;
      }
      
      if (data) {
        const formattedData = prepareFromSupabase(data);
        
        if (!formattedData.carouselImages || !Array.isArray(formattedData.carouselImages)) {
          formattedData.carouselImages = [];
        }
        
        setSiteInfo(prev => ({ ...prev, ...formattedData }));
      } else {
        setSiteInfo(DEFAULT_SITE_INFO);
        localStorage.setItem('siteInfo', JSON.stringify(DEFAULT_SITE_INFO));
        
        try {
          await saveSiteInfo({ ...DEFAULT_SITE_INFO });
        } catch (initError) {
          console.error('Failed to initialize site_info:', initError);
        }
      }
    } catch (error) {
      console.error('Failed to fetch site info from Supabase:', error);
      
      const storedSiteInfo = localStorage.getItem('siteInfo');
      if (storedSiteInfo) {
        setSiteInfo(JSON.parse(storedSiteInfo));
      } else {
        localStorage.setItem('siteInfo', JSON.stringify(DEFAULT_SITE_INFO));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSiteInfo();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:site_info')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'site_info' 
      }, (payload) => {
        console.log('Realtime site_info update:', payload);
        fetchSiteInfo();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearAllImages = async () => {
    try {
      const success = await clearCarouselImages();
      if (success) {
        setSiteInfo(prev => ({ ...prev, carouselImages: [] }));
        toast({
          title: "Imágenes eliminadas",
          description: "Todas las imágenes del carrusel han sido eliminadas correctamente.",
        });
        
        await updateSiteInfo({ carouselImages: [] });
      } else {
        throw new Error("No se pudieron eliminar las imágenes");
      }
    } catch (error) {
      console.error('Error al eliminar las imágenes:', error);
      toast({
        title: "Error al eliminar imágenes",
        description: "No se pudieron eliminar las imágenes del carrusel.",
        variant: "destructive",
      });
    }
  };

  const uploadSiteImage = async (file: File): Promise<string> => {
    try {
      const imageUrl = await uploadImage(file, 'site_images', 'site/');
      
      const updatedImages = [...siteInfo.carouselImages, imageUrl];
      await updateSiteInfo({ carouselImages: updatedImages });
      
      return imageUrl;
    } catch (error) {
      console.error('Error uploading site image:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo cargar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSiteInfo = async (updates: Partial<SiteInfo>) => {
    const updatedInfo = { ...siteInfo, ...updates };
    setSiteInfo(updatedInfo);
    
    try {
      const supabaseData = prepareForSupabase(updates);
      
      const { data: existingData, error: fetchError } = await supabase
        .from('site_info')
        .select('id')
        .limit(1);
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing site info:', fetchError);
        throw fetchError;
      }
      
      let result;
      if (existingData && existingData.length > 0) {
        result = await supabase
          .from('site_info')
          .update(supabaseData)
          .eq('id', existingData[0].id);
      } else {
        const fullData = prepareForSupabase(updatedInfo);
        
        const requiredFields: (keyof SiteInfoSupabase)[] = [
          'carousel_images', 'design_description', 'design_title', 'faq_title',
          'materials_description', 'materials_title', 'service_description', 
          'service_title', 'slogan', 'unique_style_title', 'whatsapp_number'
        ];
        
        const missingFields = requiredFields.filter(field => fullData[field] === undefined);
        
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        result = await supabase
          .from('site_info')
          .insert(fullData as any);
      }
      
      if (result.error) {
        console.error('Error updating site info in Supabase:', result.error);
        toast({
          title: "Error al guardar configuración",
          description: result.error.message,
          variant: "destructive",
        });
        throw result.error;
      }
      
      toast({
        title: "Configuración guardada",
        description: "La información del sitio ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error('Failed to save to Supabase, falling back to localStorage:', error);
      localStorage.setItem('siteInfo', JSON.stringify(updatedInfo));
    }
  };

  return (
    <SiteContext.Provider value={{ siteInfo, updateSiteInfo, uploadSiteImage, clearAllImages, isLoading }}>
      {children}
    </SiteContext.Provider>
  );
};
