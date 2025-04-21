
import React, { useState } from 'react';
import { ShoppingCart, Heart, Package, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import ProductDetailModal from './ProductDetailModal';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get available sizes
  const availableSizes = product.sizes?.filter(s => s.available) || [];
  const adultSizes = availableSizes.filter(s => !s.isChildSize);
  const kidSizes = availableSizes.filter(s => s.isChildSize);

  // Handle add to cart
  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor, quantity);
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
    }
  };

  // Get product images with fallback to the main image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : ['/placeholder.svg']);

  // Handle image navigation
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      <Card 
        className="overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg h-full flex flex-col"
        style={{ backgroundColor: product.cardColor + '10' }}
      >
        <div className="relative h-52 md:h-64 overflow-hidden cursor-pointer">
          <img
            src={productImages[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />

          {/* Product images navigation */}
          {productImages.length > 1 && (
            <>
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Image indicator dots */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                {productImages.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === currentImageIndex ? 'bg-lilac' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* "View Images" button with magnifying glass icon */}
          <div className="absolute bottom-0 right-0 m-2">
            <button 
              className="flex items-center px-3 py-1.5 rounded-md bg-white/90 text-lilac-dark text-sm hover:bg-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailModalOpen(true);
              }}
            >
              <Search className="w-4 h-4 mr-1" />
              Ver imágenes
            </button>
          </div>
        </div>

        <CardHeader className="p-4 pb-2">
          <CardTitle 
            className="font-medium text-xl mb-2 text-lilac-dark break-words whitespace-normal w-full"
            title={product.title}
          >
            {product.title}
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mb-2 line-clamp-3 h-[4.5rem]">{product.description}</CardDescription>
          <p className="font-bold text-xl mb-2 text-center">${product.price.toFixed(2)}</p>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-grow">
          <Button 
            onClick={() => setShowProductDetails(!showProductDetails)}
            variant="outline"
            className="w-full text-base mb-4 border-lilac text-lilac-dark hover:bg-lilac/10"
          >
            {showProductDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </Button>
          
          {showProductDetails && (
            <div className="space-y-4 pt-2">
              {adultSizes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tallas para adultos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {adultSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          selectedSize === size.id
                            ? 'bg-lilac text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {kidSizes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tallas para niños:</h4>
                  <div className="flex flex-wrap gap-2">
                    {kidSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          selectedSize === size.id
                            ? 'bg-lilac text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2">Colores:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.id
                          ? 'border-lilac scale-110'
                          : 'border-transparent scale-100 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Cantidad:</h4>
                <div className="flex items-center w-32 border rounded-md overflow-hidden">
                  <button
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center text-base py-2">{quantity}</div>
                  <button
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 mt-auto">
          <Button 
            onClick={handleAddToCart}
            disabled={showProductDetails && (!selectedSize || !selectedColor || product.stockQuantity <= 0)}
            className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 text-base py-6"
          >
            <ShoppingCart className="h-5 w-5" />
            Comprar
          </Button>
        </CardFooter>
      </Card>

      <ProductDetailModal
        product={product}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </>
  );
};

export default ProductCard;
