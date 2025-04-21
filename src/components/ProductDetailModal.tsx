
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from './ui/dialog';
import { Product } from '../contexts/ProductContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Add the onClose prop that Admin.tsx is using
  onClose?: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  open, 
  onOpenChange,
  onClose 
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Handle both onOpenChange and onClose based on which one is provided
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };
  
  if (!product) return null;
  
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
    setPosition({ x: 0, y: 0 }); // Reset position when zooming
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
    setPosition({ x: 0, y: 0 }); // Reset position when zooming
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limit the pan area based on zoom level
      const maxOffset = (scale - 1) * 200; // Arbitrary limit based on image size
      const limitedX = Math.max(Math.min(newX, maxOffset), -maxOffset);
      const limitedY = Math.max(Math.min(newY, maxOffset), -maxOffset);
      
      setPosition({
        x: limitedX,
        y: limitedY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white rounded-lg">
        <div className="relative">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button
              onClick={handleZoomOut}
              className="rounded-full bg-white/70 p-2 hover:bg-white shadow-md"
              disabled={scale === 1}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="rounded-full bg-white/70 p-2 hover:bg-white shadow-md"
              disabled={scale === 3}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <DialogClose className="rounded-full bg-white/70 p-2 hover:bg-white shadow-md">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
          
          {scale > 1 && (
            <div className="absolute left-4 top-4 z-10">
              <div className="rounded-full bg-white/70 p-2 shadow-md">
                <Move className="h-5 w-5" />
              </div>
            </div>
          )}
          
          <Carousel className="w-full">
            <CarouselContent className="h-full">
              {productImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div 
                    className="flex items-center justify-center p-4 h-[70vh] overflow-hidden cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} - imagen ${index + 1}`} 
                      className="w-full h-full object-contain transition-transform duration-200 select-none"
                      style={{ 
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        cursor: scale > 1 ? 'move' : 'default'
                      }}
                      draggable={false}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {productImages.length > 1 && (
              <>
                <CarouselPrevious className="left-4 bg-white/80 hover:bg-white shadow-md h-10 w-10" />
                <CarouselNext className="right-4 bg-white/80 hover:bg-white shadow-md h-10 w-10" />
              </>
            )}
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
