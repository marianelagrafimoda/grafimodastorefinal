
import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import WhatsAppButton from './WhatsAppButton';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  // Find color name from product color id
  const getColorName = (item: any) => {
    const color = item.product.colors.find((c: any) => c.id === item.selectedColor);
    return color ? color.name : item.selectedColor;
  };

  // Find color hex from product color id
  const getColorHex = (item: any) => {
    const color = item.product.colors.find((c: any) => c.id === item.selectedColor);
    return color ? color.hex : "#CCCCCC";
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}
      
      {/* Cart Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full md:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-serif text-xl font-medium">Carrito de Compras</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <button 
                  onClick={onClose}
                  className="btn-primary"
                >
                  Continuar comprando
                </button>
              </div>
            ) : (
              <ul className="divide-y">
                {items.map((item, index) => (
                  <li key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded overflow-hidden shrink-0">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.title}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.title}</h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-sm text-gray-600">Talla: {item.selectedSize}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Color:</span>
                            <span 
                              className="w-4 h-4 rounded-full inline-block border" 
                              style={{ backgroundColor: getColorHex(item) }}
                            ></span>
                            <span className="text-sm text-gray-600">{getColorName(item)}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium mt-1">${item.product.price.toFixed(2)}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-1 rounded border hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          <span className="w-8 text-center">{item.quantity}</span>
                          
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-1 rounded border hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          
                          <button 
                            onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                            className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer with Total and Checkout */}
          {items.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between text-lg font-medium mb-4">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              <WhatsAppButton mode="cart" className="w-full mb-2" />
              
              <button 
                onClick={onClose}
                className="w-full py-2 text-center text-gray-600 hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
