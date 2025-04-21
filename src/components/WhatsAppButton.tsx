
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useSiteInfo } from '../contexts/SiteContext';

interface WhatsAppButtonProps {
  className?: string;
  mode?: 'default' | 'cart';
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  className = "",
  mode = 'default'
}) => {
  const { siteInfo } = useSiteInfo();
  const { items, totalPrice } = useCart();
  
  // Helper function to get color name
  const getColorName = (item: any) => {
    const color = item.product.colors.find((c: any) => c.id === item.selectedColor);
    return color ? color.name : item.selectedColor;
  };
  
  const generateWhatsAppMessage = () => {
    if (mode === 'cart' && items.length > 0) {
      // Mensaje para pedido desde carrito
      let message = "¡Hola! Me gustaría hacer el siguiente pedido:\n\n";
      
      items.forEach((item) => {
        message += `- ${item.quantity}x ${item.product.title} (Talla: ${item.selectedSize}, Color: ${getColorName(item)}) - $${(item.product.price * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\nTotal: $${totalPrice.toFixed(2)}`;
      message += "\n\nPor favor, ¿me podrías ayudar a completar mi compra?";
      
      return encodeURIComponent(message);
    } else {
      // Mensaje para personalización
      return encodeURIComponent("¡Hola! Me gustaría información sobre cómo personalizar mi prenda.");
    }
  };
  
  const handleClick = () => {
    // Use the specified WhatsApp number or fallback to the one in siteInfo
    const whatsappNumber = "593990893095"; // Number without + as requested
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const defaultClassName = "bg-white text-black hover:bg-gray-100 flex items-center justify-center gap-2 font-medium transition-all duration-300 shadow-sm hover:shadow mx-auto";
  
  return (
    <Button 
      onClick={handleClick}
      className={`${defaultClassName} ${className} px-6 py-3 rounded-md text-base`}
    >
      <MessageSquare className="h-5 w-5 mr-2" />
      {mode === 'cart' ? 'Finalizar Compra por WhatsApp' : 'Quiero personalizar mi estilo'}
    </Button>
  );
};

export default WhatsAppButton;
