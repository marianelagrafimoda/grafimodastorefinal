import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  ImageIcon, 
  Tag, 
  ShoppingBag, 
  Edit3, 
  Save, 
  X, 
  Palette,
  Package,
  Plus,
  Trash2,
  Loader2,
  Instagram,
  Facebook,
  RefreshCcw,
  Search,
  ClipboardList
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useSiteInfo } from '../contexts/SiteContext';
import { useProducts, Color, Product } from '../contexts/ProductContext';
import { useToast } from '../hooks/use-toast';
import ImageUploader from '../components/ImageUploader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { setupDatabase } from '../lib/supabase';
import { logAdminActivity, EntityType } from '../lib/admin-activity-logger';
import ProductEditor from '../components/ProductEditor';
import ProductImagesUploader from '../components/ProductImagesUploader';
import ProductDetailModal from '../components/ProductDetailModal';
import FaqEditor from '../components/admin/FaqEditor';
import PedidosManager from '../components/admin/PedidosManager';
import AboutUsEditor from '../components/admin/AboutUsEditor';
import PrivacyPolicyEditor from '../components/admin/PrivacyPolicyEditor';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { siteInfo, updateSiteInfo, uploadSiteImage, clearAllImages, isLoading: isSiteLoading } = useSiteInfo();
  const { products, updateProduct, addProduct, removeProduct, uploadProductImage, isLoading: isProductsLoading } = useProducts();
  const { toast } = useToast();
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const [newSlogan, setNewSlogan] = useState(siteInfo.slogan);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState(siteInfo.whatsappNumber);
  const [newInstagramLink, setNewInstagramLink] = useState(siteInfo.instagramLink || 'https://www.instagram.com/');
  const [newFacebookLink, setNewFacebookLink] = useState(siteInfo.facebookLink || 'https://www.facebook.com/');
  const [newCarouselImages, setNewCarouselImages] = useState<string[]>(siteInfo.carouselImages);
  
  const [footerLogoUrl, setFooterLogoUrl] = useState(siteInfo.footerLogoUrl);
  const [footerAboutText, setFooterAboutText] = useState(siteInfo.footerAboutText || '');
  const [footerLinksTitle, setFooterLinksTitle] = useState(siteInfo.footerLinksTitle || 'Enlaces Rápidos');
  const [footerContactTitle, setFooterContactTitle] = useState(siteInfo.footerContactTitle || 'Contacto');
  const [emailAddress, setEmailAddress] = useState(siteInfo.emailAddress || 'marianela.grafimoda@gmail.com');
  const [address, setAddress] = useState(siteInfo.address || '');
  const [footerAdditionalInfo, setFooterAdditionalInfo] = useState(siteInfo.footerAdditionalInfo || '');
  const [footerCopyrightText, setFooterCopyrightText] = useState(siteInfo.footerCopyrightText || '');
  const [footerCustomLinks, setFooterCustomLinks] = useState<Array<{label: string; url: string}>>(
    siteInfo.footerCustomLinks || []
  );
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  const [isUploadingProduct, setIsUploadingProduct] = useState(isProductsLoading);
  const [isUploadingCarousel, setIsUploadingCarousel] = useState(false);
  const [isUploadingFooterLogo, setIsUploadingFooterLogo] = useState(false);
  const [isClearingImages, setIsClearingImages] = useState(false);
  
  const [newMaterialsTitle, setNewMaterialsTitle] = useState(siteInfo.materialsTitle);
  const [newMaterialsDesc, setNewMaterialsDesc] = useState(siteInfo.materialsDescription);
  const [newDesignTitle, setNewDesignTitle] = useState(siteInfo.designTitle);
  const [newDesignDesc, setNewDesignDesc] = useState(siteInfo.designDescription);
  const [newServiceTitle, setNewServiceTitle] = useState(siteInfo.serviceTitle);
  const [newServiceDesc, setNewServiceDesc] = useState(siteInfo.serviceDescription);
  const [newFaqTitle, setNewFaqTitle] = useState(siteInfo.faqTitle);
  const [newUniqueStyleTitle, setNewUniqueStyleTitle] = useState(siteInfo.uniqueStyleTitle);
  
  const [newProduct, setNewProduct] = useState<Product>({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    images: [],
    cardColor: '#C8B6E2',
    stockQuantity: 0,
    sizes: [
      { id: 's', name: 'S', available: true, isChildSize: false },
      { id: 'm', name: 'M', available: true, isChildSize: false },
      { id: 'l', name: 'L', available: true, isChildSize: false },
      { id: 'xl', name: 'XL', available: true, isChildSize: false },
      { id: 'kids-s', name: 'Niños S', available: true, isChildSize: true },
      { id: 'kids-m', name: 'Niños M', available: true, isChildSize: true },
      { id: 'kids-l', name: 'Niños L', available: true, isChildSize: true }
    ],
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF' }
    ],
    id: '' // Will be set when adding
  });

  const [newAdultSizeName, setNewAdultSizeName] = useState('');
  const [newChildSizeName, setNewChildSizeName] = useState('');
  const [newProductsTitle, setNewProductsTitle] = useState(siteInfo.productsTitle);
  const [newProductsSubtitle, setNewProductsSubtitle] = useState(siteInfo.productsSubtitle);
  const [newProductsDescription, setNewProductsDescription] = useState(siteInfo.productsDescription);

  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
    
    setupDatabase().catch(error => {
      console.error("Error setting up database from AdminPage:", error);
    });
  }, [isAuthenticated, isAdmin, navigate]);

  React.useEffect(() => {
    if (!isSiteLoading) {
      setNewSlogan(siteInfo.slogan);
      setNewWhatsappNumber(siteInfo.whatsappNumber);
      setNewInstagramLink(siteInfo.instagramLink || 'https://www.instagram.com/');
      setNewFacebookLink(siteInfo.facebookLink || 'https://www.facebook.com/');
      setNewCarouselImages(siteInfo.carouselImages);
      setNewMaterialsTitle(siteInfo.materialsTitle);
      setNewMaterialsDesc(siteInfo.materialsDescription);
      setNewDesignTitle(siteInfo.designTitle);
      setNewDesignDesc(siteInfo.designDescription);
      setNewServiceTitle(siteInfo.serviceTitle);
      setNewServiceDesc(siteInfo.serviceDescription);
      setNewFaqTitle(siteInfo.faqTitle);
      setNewUniqueStyleTitle(siteInfo.uniqueStyleTitle);
      
      setFooterLogoUrl(siteInfo.footerLogoUrl || '');
      setFooterAboutText(siteInfo.footerAboutText || '');
      setFooterLinksTitle(siteInfo.footerLinksTitle || 'Enlaces Rápidos');
      setFooterContactTitle(siteInfo.footerContactTitle || 'Contacto');
      setEmailAddress(siteInfo.emailAddress || 'marianela.grafimoda@gmail.com');
      setAddress(siteInfo.address || '');
      setFooterAdditionalInfo(siteInfo.footerAdditionalInfo || '');
      setFooterCopyrightText(siteInfo.footerCopyrightText || '');
      setFooterCustomLinks(siteInfo.footerCustomLinks || []);
      setNewProductsTitle(siteInfo.productsTitle);
      setNewProductsSubtitle(siteInfo.productsSubtitle);
      setNewProductsDescription(siteInfo.productsDescription);
    }
  }, [siteInfo, isSiteLoading, siteInfo.slogan, siteInfo.whatsappNumber, siteInfo.instagramLink, siteInfo.facebookLink, siteInfo.carouselImages, siteInfo.materialsTitle, siteInfo.materialsDescription, siteInfo.designTitle, siteInfo.designDescription, siteInfo.serviceTitle, siteInfo.serviceDescription, siteInfo.faqTitle, siteInfo.uniqueStyleTitle, siteInfo.footerLogoUrl, siteInfo.footerAboutText, siteInfo.footerLinksTitle, siteInfo.footerContactTitle, siteInfo.emailAddress, siteInfo.address, siteInfo.footerAdditionalInfo, siteInfo.footerCopyrightText, siteInfo.footerCustomLinks, siteInfo.productsTitle, siteInfo.productsSubtitle, siteInfo.productsDescription]);

  const handleSiteInfoUpdate = () => {
    updateSiteInfo({
      slogan: newSlogan,
      whatsappNumber: newWhatsappNumber,
      instagramLink: newInstagramLink,
      facebookLink: newFacebookLink,
      carouselImages: newCarouselImages,
      materialsTitle: newMaterialsTitle,
      materialsDescription: newMaterialsDesc,
      designTitle: newDesignTitle,
      designDescription: newDesignDesc,
      serviceTitle: newServiceTitle,
      serviceDescription: newServiceDesc,
      faqTitle: newFaqTitle,
      uniqueStyleTitle: newUniqueStyleTitle,
      footerLogoUrl,
      footerAboutText,
      footerLinksTitle,
      footerContactTitle,
      emailAddress,
      address,
      footerAdditionalInfo,
      footerCopyrightText,
      footerCustomLinks,
      productsTitle: newProductsTitle,
      productsSubtitle: newProductsSubtitle,
      productsDescription: newProductsDescription,
    });
    toast({
      title: "¡Actualizado!",
      description: "Información del sitio actualizada con éxito",
      duration: 3000,
    });
  };

  const removeCarouselImage = (image: string) => {
    setNewCarouselImages(newCarouselImages.filter(img => img !== image));
  };
  
  const handleClearAllImages = async () => {
    if (window.confirm('¿Está seguro que desea eliminar todas las imágenes del carrusel?')) {
      setIsClearingImages(true);
      try {
        await clearAllImages();
        setNewCarouselImages([]);
        
        if (user && user.isAdmin) {
          await logAdminActivity({
            adminEmail: user.email,
            actionType: 'delete',
            entityType: 'carousel_image',
            details: {
              action: 'clear_all_images'
            }
          });
        }
      } finally {
        setIsClearingImages(false);
      }
    }
  };
  
  const handleUploadCarouselImage = async (file: File) => {
    setIsUploadingCarousel(true);
    try {
      await setupDatabase();
      
      const imageUrl = await uploadSiteImage(file);
      setNewCarouselImages(prev => [...prev, imageUrl]);
      
      if (user && user.isAdmin) {
        await logAdminActivity({
          adminEmail: user.email,
          actionType: 'create',
          entityType: 'carousel_image',
          details: {
            filename: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });
      }
      
      return imageUrl;
    } finally {
      setIsUploadingCarousel(false);
    }
  };
  
  const handleUploadProductImage = async (file: File) => {
    setIsUploadingProduct(true);
    try {
      const imageUrl = await uploadProductImage(file);
      
      if (!editingProduct) {
        setNewProduct(prev => ({ 
          ...prev, 
          imageUrl: imageUrl,
          images: [...(prev.images || []), imageUrl]
        }));
      }
      
      if (user && user.isAdmin) {
        await logAdminActivity({
          adminEmail: user.email,
          actionType: 'create',
          entityType: 'product' as EntityType,
          details: {
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            productTitle: editingProduct ? editingProduct.title : newProduct.title
          }
        });
      }
      
      return imageUrl;
    } finally {
      setIsUploadingProduct(false);
    }
  };
  
  const handleProductImagesChange = (newImages: string[]) => {
    setNewProduct({
      ...newProduct,
      images: newImages,
      imageUrl: newImages.length > 0 ? newImages[0] : ''
    });
  };

  const handleAddProduct = () => {
    if (
      newProduct.title &&
      newProduct.price > 0
    ) {
      const productToAdd = {
        ...newProduct,
        id: crypto.randomUUID(),
        title: newProduct.title,
        description: newProduct.description || '',
        price: newProduct.price,
        imageUrl: newProduct.imageUrl || '/placeholder.svg',
        images: newProduct.images || [],
        stockQuantity: newProduct.stockQuantity,
        cardColor: newProduct.cardColor,
        sizes: newProduct.sizes,
        colors: newProduct.colors
      };
      
      addProduct(productToAdd);
      
      setNewProduct({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        images: [],
        cardColor: '#C8B6E2',
        stockQuantity: 0,
        sizes: [
          { id: 's', name: 'S', available: true, isChildSize: false },
          { id: 'm', name: 'M', available: true, isChildSize: false },
          { id: 'l', name: 'L', available: true, isChildSize: false },
          { id: 'xl', name: 'XL', available: true, isChildSize: false },
          { id: 'kids-s', name: 'Niños S', available: true, isChildSize: true },
          { id: 'kids-m', name: 'Niños M', available: true, isChildSize: true },
          { id: 'kids-l', name: 'Niños L', available: true, isChildSize: true }
        ],
        colors: [
          { id: 'white', name: 'Blanco', hex: '#FFFFFF' }
        ],
        id: ''
      });
      
      toast({
        title: "¡Producto agregado!",
        description: "El producto ha sido agregado exitosamente",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor complete el título y precio del producto",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const startEditingProduct = (product: Product) => {
    const hasKidsSizes = product.sizes.some((size) => 
      size.id === 'kids-s' || size.id === 'kids-m' || size.id === 'kids-l' || size.isChildSize
    );
    
    const productToEdit = {
      ...product,
      images: product.images || (product.imageUrl ? [product.imageUrl] : [])
    };
    
    if (!hasKidsSizes) {
      const updatedSizes = [
        ...productToEdit.sizes,
        { id: 'kids-s', name: 'Niños S', available: false, isChildSize: true },
        { id: 'kids-m', name: 'Niños M', available: false, isChildSize: true },
        { id: 'kids-l', name: 'Niños L', available: false, isChildSize: true }
      ];
      setEditingProduct({...productToEdit, sizes: updatedSizes});
    } else {
      setEditingProduct(productToEdit);
    }
  };

  const cancelEditingProduct = () => {
    setEditingProduct(null);
  };

  const saveEditedProduct = (updatedProduct: Product) => {
    updateProduct(updatedProduct.id, updatedProduct);
    setEditingProduct(null);
    toast({
      title: "¡Actualizado!",
      description: "Producto actualizado con éxito",
      duration: 3000,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      removeProduct(productId);
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
        duration: 3000,
      });
    }
  };

  const toggleSizeAvailability = (product: Product, sizeId: string) => {
    const updatedSizes = product.sizes.map(size => 
      size.id === sizeId ? { ...size, available: !size.available } : size
    );
    
    const productToUpdate = {
      ...product,
      sizes: updatedSizes
    };
    
    updateProduct(product.id, productToUpdate);
  };

  const previewProductDetails = (product: Product) => {
    setPreviewProduct(product);
    setIsPreviewModalOpen(true);
  };

  const handleAddAdultSize = () => {
    if (newAdultSizeName) {
      const sizeId = `adult-${newAdultSizeName.toLowerCase().replace(/\s+/g, '-')}`;
      if (!newProduct.sizes.some(size => size.id === sizeId)) {
        const newSizes = [
          ...newProduct.sizes,
          { id: sizeId, name: newAdultSizeName, available: true, isChildSize: false }
        ];
        setNewProduct({...newProduct, sizes: newSizes});
        setNewAdultSizeName('');
      }
    }
  };

  const handleAddChildSize = () => {
    if (newChildSizeName) {
      const sizeId = `child-${newChildSizeName.toLowerCase().replace(/\s+/g, '-')}`;
      if (!newProduct.sizes.some(size => size.id === sizeId)) {
        const newSizes = [
          ...newProduct.sizes,
          { id: sizeId, name: newChildSizeName, available: true, isChildSize: true }
        ];
        setNewProduct({...newProduct, sizes: newSizes});
        setNewChildSizeName('');
      }
    }
  };

  const handleRemoveSize = (sizeId: string) => {
    const newSizes = newProduct.sizes.filter(size => size.id !== sizeId);
    setNewProduct({...newProduct, sizes: newSizes});
  };

  const handleUploadFooterLogo = async (file: File) => {
    setIsUploadingFooterLogo(true);
    try {
      await setupDatabase();
      
      const imageUrl = await uploadSiteImage(file);
      setFooterLogoUrl(imageUrl);
      
      if (user && user.isAdmin) {
        await logAdminActivity({
          adminEmail: user.email,
          actionType: 'update',
          entityType: 'site_info',
          details: {
            field: 'footer_logo',
            filename: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });
      }
      
      return imageUrl;
    } finally {
      setIsUploadingFooterLogo(false);
    }
  };

  const handleFooterInfoUpdate = () => {
    updateSiteInfo({
      footerLogoUrl,
      footerAboutText,
      footerLinksTitle,
      footerContactTitle,
      emailAddress,
      address,
      footerAdditionalInfo,
      footerCopyrightText,
      footerCustomLinks
    });
    toast({
      title: "¡Actualizado!",
      description: "Información del footer actualizada con éxito",
      duration: 3000,
    });
  };

  const handleAddCustomLink = () => {
    if (newLinkLabel && newLinkUrl) {
      setFooterCustomLinks([...footerCustomLinks, {
        label: newLinkLabel,
        url: newLinkUrl
      }]);
      setNewLinkLabel('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveCustomLink = (index: number) => {
    const updatedLinks = [...footerCustomLinks];
    updatedLinks.splice(index, 1);
    setFooterCustomLinks(updatedLinks);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (isSiteLoading || isProductsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-lilac" />
        <p className="mt-4 text-lg">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-admin-panel="true">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-center text-lilac-dark">
            Panel de Administración
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Gestione los productos y la información del sitio
          </p>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none h-auto">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="site">Sitio</TabsTrigger>
            <TabsTrigger value="carousel">Carrusel</TabsTrigger>
            <TabsTrigger value="footer">Pie de página</TabsTrigger>
            <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="about">Quiénes Somos</TabsTrigger>
            <TabsTrigger value="privacy">Política de Privacidad</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6 animate-fade-in">
            <Card className="shadow-md border-lilac/20">
              <CardHeader>
                <CardTitle className="font-serif">Agregar Nuevo Producto</CardTitle>
                <CardDescription>
                  Complete el formulario para agregar un nuevo producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                      placeholder="Nombre del producto"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precio ($)</label>
                    <Input
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Descripción corta del producto"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imágenes del Producto</label>
                  <div className="mt-2">
                    <ProductImagesUploader 
                      images={newProduct.images || []}
                      onImagesChange={handleProductImagesChange}
                      onImageUpload={handleUploadProductImage}
                      maxImages={6}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad en Stock</label>
                  <Input
                    type="number"
                    value={newProduct.stockQuantity || ''}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    min="0"
                    className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Color de la Tarjeta
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={newProduct.cardColor}
                      onChange={(e) => setNewProduct({...newProduct, cardColor: e.target.value})}
                      className="w-10 h-10 rounded border p-1"
                    />
                    <Input
                      value={newProduct.cardColor}
                      onChange={(e) => setNewProduct({...newProduct, cardColor: e.target.value})}
                      placeholder="#C8B6E2"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tallas Disponibles</label>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tallas para adultos:</p>
                      <div className="flex flex-wrap gap-2">
                        {newProduct.sizes.filter(size => !size.isChildSize).map((size) => (
                          <div key={size.id} className="flex items-center bg-gray-100 rounded-lg text-sm">
                            <button
                              onClick={() => {
                                const updatedSizes = newProduct.sizes.map(s => 
                                  s.id === size.id ? {...s, available: !s.available} : s
                                );
                                setNewProduct({...newProduct, sizes: updatedSizes});
                              }}
                              className={`px-2 py-1 rounded-l-lg ${
                                size.available
                                  ? 'bg-lilac text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {size.name}
                            </button>
                            <button
                              onClick={() => handleRemoveSize(size.id)}
                              className="px-1 text-gray-500 hover:text-red-500 rounded-r-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex mt-2">
                        <Input
                          value={newAdultSizeName}
                          onChange={(e) => setNewAdultSizeName(e.target.value)}
                          placeholder="Nueva talla adulto"
                          className="border-lilac/30 text-sm max-w-[180px]"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAddAdultSize}
                          className="ml-2 bg-lilac hover:bg-lilac-dark"
                          disabled={!newAdultSizeName}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tallas para niños:</p>
                      <div className="flex flex-wrap gap-2">
                        {newProduct.sizes.filter(size => size.isChildSize).map((size) => (
                          <div key={size.id} className="flex items-center bg-gray-100 rounded-lg text-sm">
                            <button
                              onClick={() => {
                                const updatedSizes = newProduct.sizes.map(s => 
                                  s.id === size.id ? {...s, available: !s.available} : s
                                );
                                setNewProduct({...newProduct, sizes: updatedSizes});
                              }}
                              className={`px-2 py-1 rounded-l-lg ${
                                size.available
                                  ? 'bg-lilac text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {size.name}
                            </button>
                            <button
                              onClick={() => handleRemoveSize(size.id)}
                              className="px-1 text-gray-500 hover:text-red-500 rounded-r-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex mt-2">
                        <Input
                          value={newChildSizeName}
                          onChange={(e) => setNewChildSizeName(e.target.value)}
                          placeholder="Nueva talla niño"
                          className="border-lilac/30 text-sm max-w-[180px]"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAddChildSize}
                          className="ml-2 bg-lilac hover:bg-lilac-dark"
                          disabled={!newChildSizeName}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 border-t pt-4 mt-2">
                  <label className="text-sm font-medium">Colores Disponibles</label>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newProduct.colors.map((color) => (
                      <div key={color.id} className="flex items-center gap-2 bg-gray-100 p-1 pr-2 rounded">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="text-sm">{color.name}</span>
                        <button 
                          onClick={() => {
                            const newColors = newProduct.colors.filter(c => c.id !== color.id);
                            setNewProduct({...newProduct, colors: newColors});
                          }}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-2">
                    <Input
                      value={newProduct.newColorName}
                      onChange={(e) => {
                        // @ts-ignore
                        setNewProduct({...newProduct, newColorName: e.target.value});
                      }}
                      placeholder="Nombre del color"
                      className="border-lilac/30 focus:border-lilac focus:ring-lilac flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newProduct.newColorHex}
                        onChange={(e) => {
                          // @ts-ignore
                          setNewProduct({...newProduct, newColorHex: e.target.value});
                        }}
                        className="w-10 h-10 rounded border p-1"
                      />
                      <Button
                        onClick={() => {
                          if (newProduct.newColorName) {
                            const colorId = newProduct.newColorName.toLowerCase().replace(/\s+/g, '-');
                            const newColor: Color = {
                              id: colorId,
                              name: newProduct.newColorName,
                              // @ts-ignore
                              hex: newProduct.newColorHex || '#FFFFFF'
                            };
                            setNewProduct({
                              ...newProduct,
                              colors: [...newProduct.colors, newColor],
                              // @ts-ignore
                              newColorName: '',
                              // @ts-ignore
                              newColorHex: '#FFFFFF'
                            });
                          }
                        }}
                        type="button"
                        className="bg-lilac hover:bg-lilac-dark"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAddProduct}
                  className="w-full bg-lilac hover:bg-lilac-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </CardFooter>
            </Card>

            {editingProduct ? (
              <ProductEditor
                product={editingProduct}
                onSave={saveEditedProduct}
                onCancel={cancelEditingProduct}
                onImageUpload={handleUploadProductImage}
              />
            ) : (
              <Card className="shadow-md border-lilac/20 mt-6">
                <CardHeader>
                  <CardTitle className="font-serif">Productos Existentes</CardTitle>
                  <CardDescription>
                    Administre los productos existentes en su tienda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.length === 0 ? (
                      <p className="text-muted-foreground">No hay productos existentes.</p>
                    ) : (
                      products.map((product) => (
                        <div 
                          key={product.id} 
                          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          style={{
                            backgroundColor: `${product.cardColor}05`, // 05 adds 5% opacity to the color
                            borderColor: `${product.cardColor}30` // 30 adds 30% opacity to the color
                          }}
                        >
                          <div className="aspect-video relative overflow-hidden bg-gray-100">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                                <ImageIcon className="h-10 w-10" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-lg truncate">{product.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 h-10">{product.description}</p>
                            <p className="font-semibold mt-1">${product.price.toFixed(2)}</p>
                            
                            <div className="mt-3 flex flex-wrap gap-1">
                              {product.sizes.filter(size => size.available).map((size) => (
                                <span key={size.id} className="text-xs bg-white px-2 py-1 rounded-full border">
                                  {size.name}
                                </span>
                              ))}
                            </div>
                            
                            <div className="mt-4 flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => startEditingProduct(product)}
                              >
                                <Edit3 className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Borrar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="site" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Información General del Sitio</CardTitle>
                <CardDescription>Actualice la información principal de su sitio web</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slogan</label>
                    <Input
                      value={newSlogan}
                      onChange={(e) => setNewSlogan(e.target.value)}
                      className="border-lilac/30"
                      placeholder="El slogan de su sitio web"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">WhatsApp (con código de país)</label>
                    <Input
                      value={newWhatsappNumber}
                      onChange={(e) => setNewWhatsappNumber(e.target.value)}
                      className="border-lilac/30"
                      placeholder="+573001234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram URL
                    </label>
                    <Input
                      value={newInstagramLink}
                      onChange={(e) => setNewInstagramLink(e.target.value)}
                      className="border-lilac/30"
                      placeholder="https://www.instagram.com/su_cuenta"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook URL
                    </label>
                    <Input
                      value={newFacebookLink}
                      onChange={(e) => setNewFacebookLink(e.target.value)}
                      className="border-lilac/30"
                      placeholder="https://www.facebook.com/su_pagina"
                    />
                  </div>
                </div>
                
                <div className="border-t pt-5 mt-2">
                  <h3 className="text-lg font-medium mb-3">Sección de Productos</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Título de la sección</label>
                      <Input
                        value={newProductsTitle}
                        onChange={(e) => setNewProductsTitle(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="Nuestros Productos"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subtítulo de la sección</label>
                      <Input
                        value={newProductsSubtitle}
                        onChange={(e) => setNewProductsSubtitle(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="Explora nuestra colección"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descripción de la sección</label>
                      <Input
                        value={newProductsDescription}
                        onChange={(e) => setNewProductsDescription(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="Descubre nuestra selección de productos únicos..."
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-5 mt-2">
                  <h3 className="text-lg font-medium mb-3">Sección de Características</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Título - Materiales</label>
                        <Input
                          value={newMaterialsTitle}
                          onChange={(e) => setNewMaterialsTitle(e.target.value)}
                          className="border-lilac/30 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Descripción - Materiales</label>
                        <Input
                          value={newMaterialsDesc}
                          onChange={(e) => setNewMaterialsDesc(e.target.value)}
                          className="border-lilac/30 mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Título - Diseño</label>
                        <Input
                          value={newDesignTitle}
                          onChange={(e) => setNewDesignTitle(e.target.value)}
                          className="border-lilac/30 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Descripción - Diseño</label>
                        <Input
                          value={newDesignDesc}
                          onChange={(e) => setNewDesignDesc(e.target.value)}
                          className="border-lilac/30 mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Título - Servicio</label>
                        <Input
                          value={newServiceTitle}
                          onChange={(e) => setNewServiceTitle(e.target.value)}
                          className="border-lilac/30 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Descripción - Servicio</label>
                        <Input
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          className="border-lilac/30 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <label className="text-sm font-medium">Título - FAQ</label>
                    <Input
                      value={newFaqTitle}
                      onChange={(e) => setNewFaqTitle(e.target.value)}
                      className="border-lilac/30 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Título - Estilo Único</label>
                    <Input
                      value={newUniqueStyleTitle}
                      onChange={(e) => setNewUniqueStyleTitle(e.target.value)}
                      className="border-lilac/30 mt-1"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSiteInfoUpdate}
                  className="w-full bg-lilac hover:bg-lilac-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="carousel" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Imágenes del Carrusel</CardTitle>
                <CardDescription>
                  Administre las imágenes que se muestran en el carrusel principal de la página
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ImageUploader 
                    label="Subir imagen para el carrusel" 
                    onImageUpload={handleUploadCarouselImage} 
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Imágenes actuales ({newCarouselImages.length})</h3>
                    
                    {newCarouselImages.length === 0 && (
                      <p className="text-sm text-gray-500">No hay imágenes en el carrusel</p>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {newCarouselImages.map((image, index) => (
                        <div key={index} className="relative group border rounded-md overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Imagen de carrusel ${index + 1}`}
                            className="w-full aspect-[16/9] object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <button
                              onClick={() => removeCarouselImage(image)}
                              className="bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  variant="outline"
                  onClick={handleClearAllImages}
                  disabled={newCarouselImages.length === 0 || isClearingImages}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  {isClearingImages ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Eliminar Todas
                </Button>
                
                <Button 
                  onClick={handleSiteInfoUpdate}
                  className="bg-lilac hover:bg-lilac-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="footer" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Personalizar Pie de Página</CardTitle>
                <CardDescription>
                  Administre la información que se muestra en el pie de página del sitio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Logo del Pie de Página</label>
                  <div className="mt-2 flex items-start space-x-4">
                    <div className="w-32">
                      <ImageUploader 
                        label="Subir logo" 
                        onImageUpload={handleUploadFooterLogo} 
                      />
                    </div>
                    
                    {footerLogoUrl && (
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={footerLogoUrl} 
                          alt="Logo del Pie de Página" 
                          className="max-h-32 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Texto "Acerca de"</label>
                      <Input
                        value={footerAboutText}
                        onChange={(e) => setFooterAboutText(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="Breve descripción sobre su negocio"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Título de Enlaces</label>
                      <Input
                        value={footerLinksTitle}
                        onChange={(e) => setFooterLinksTitle(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="Enlaces Rápidos"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Título de Contacto</label>
                      <Input
                        value={footerContactTitle}
                        onChange={(e) => setFooterContactTitle(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="Contacto"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Correo Electrónico</label>
                      <Input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Dirección</label>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="Dirección física de su negocio"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Texto de Copyright</label>
                      <Input
                        value={footerCopyrightText}
                        onChange={(e) => setFooterCopyrightText(e.target.value)}
                        className="border-lilac/30 mt-1"
                        placeholder="© 2023 Tu Empresa"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Información Adicional</label>
                  <Input
                    value={footerAdditionalInfo}
                    onChange={(e) => setFooterAdditionalInfo(e.target.value)}
                    className="border-lilac/30 mt-1"
                    placeholder="Información adicional para el pie de página"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Enlaces Personalizados</label>
                  
                  <div className="space-y-2 mb-4">
                    {footerCustomLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="border rounded-md px-3 py-1.5 flex-1 text-sm flex items-center justify-between">
                          <span>{link.label}</span>
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">{link.url}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveCustomLink(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Input
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="Texto del enlace"
                      className="border-lilac/30 sm:col-span-1"
                    />
                    <Input
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="URL (ej: https://...)"
                      className="border-lilac/30 sm:col-span-2"
                    />
                    <Button
                      onClick={handleAddCustomLink}
                      disabled={!newLinkLabel || !newLinkUrl}
                      className="bg-lilac hover:bg-lilac-dark sm:col-span-1"
                    >
                      <Plus className="h-4 w-4 mr-1" /> 
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleFooterInfoUpdate}
                  className="w-full bg-lilac hover:bg-lilac-dark"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="faq" className="animate-fade-in">
            <FaqEditor />
          </TabsContent>
          
          <TabsContent value="pedidos" className="animate-fade-in">
            <PedidosManager />
          </TabsContent>
          
          <TabsContent value="about" className="animate-fade-in">
            <AboutUsEditor />
          </TabsContent>
          
          <TabsContent value="privacy" className="animate-fade-in">
            <PrivacyPolicyEditor />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
      
      {previewProduct && (
        <ProductDetailModal
          product={previewProduct}
          open={isPreviewModalOpen}
          onOpenChange={setIsPreviewModalOpen}
        />
      )}
    </div>
  );
};

export default Admin;
