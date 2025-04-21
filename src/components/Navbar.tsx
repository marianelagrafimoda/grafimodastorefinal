import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, X, ChevronDown, Info } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSiteInfo } from '../contexts/SiteContext';
import Cart from './Cart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { siteInfo } = useSiteInfo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const whatsappUrl = `https://wa.me/${siteInfo.whatsappNumber.replace(/\+/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCategoryClick = (category: string) => {
    navigate('/', { state: { scrollTo: category } });
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="container-custom mx-auto flex justify-between items-center">
          <a 
            href="#" 
            onClick={handleLogoClick}
            className="flex items-center space-x-2"
          >
            <img src="/lovable-uploads/9ecb5286-6e91-4b1e-9ea2-f2bb91f4df50.png" alt="GrafiModa" className="h-10" />
          </a>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-lilac-dark transition-colors">Inicio</Link>
            
            <Link 
              to="/quienes-somos" 
              className="text-foreground hover:text-lilac-dark transition-colors flex items-center gap-2"
            >
              Quiénes Somos
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="text-foreground hover:text-lilac-dark transition-colors flex items-center gap-1">
                Productos <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-white">
                <DropdownMenuItem onClick={() => handleCategoryClick('camisetas')} className="cursor-pointer">
                  Camisetas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCategoryClick('sudaderas')} className="cursor-pointer">
                  Sudaderas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCategoryClick('cojines')} className="cursor-pointer">
                  Cojines
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCategoryClick('productos')} className="cursor-pointer">
                  Ver todo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a 
              href={`https://wa.me/${siteInfo.whatsappNumber.replace(/\+/g, '')}?text=Quiero%20personalizar%20mi%20propio%20estilo`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-lilac-dark transition-colors"
            >
              Personalización
            </a>
            {isAuthenticated && isAdmin ? (
              <Link to="/admin" className="text-foreground hover:text-lilac-dark transition-colors">
                Panel de Administración
              </Link>
            ) : null}
            {isAuthenticated ? (
              <button onClick={logout} className="text-foreground hover:text-lilac-dark transition-colors">
                Cerrar Sesión
              </button>
            ) : (
              <Link to="/login" className="text-foreground hover:text-lilac-dark transition-colors">
                Iniciar Sesión
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleCart}
              className="relative p-2 hover:bg-lilac/10 rounded-full transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-lilac text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            
            <button 
              onClick={toggleMobileMenu} 
              className="p-2 md:hidden hover:bg-lilac/10 rounded-full transition-colors"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-[70px] left-0 right-0 bg-white shadow-md z-50 transition-all duration-300 opacity-100 transform translate-y-0">
            <div className="container-custom mx-auto py-4 flex flex-col space-y-4">
              <Link to="/" onClick={toggleMobileMenu} className="text-foreground hover:text-lilac-dark py-2 transition-colors">
                Inicio
              </Link>
              
              <Link to="/quienes-somos" onClick={toggleMobileMenu} className="text-foreground hover:text-lilac-dark py-2 transition-colors flex items-center gap-2">
                Quiénes Somos
              </Link>

              <div className="space-y-2 pl-4">
                <div className="text-foreground py-2">Productos</div>
                <button 
                  onClick={() => handleCategoryClick('camisetas')} 
                  className="block w-full text-left text-foreground hover:text-lilac-dark py-2 transition-colors pl-4"
                >
                  Camisetas
                </button>
                <button 
                  onClick={() => handleCategoryClick('sudaderas')} 
                  className="block w-full text-left text-foreground hover:text-lilac-dark py-2 transition-colors pl-4"
                >
                  Sudaderas
                </button>
                <button 
                  onClick={() => handleCategoryClick('cojines')} 
                  className="block w-full text-left text-foreground hover:text-lilac-dark py-2 transition-colors pl-4"
                >
                  Cojines
                </button>
                <button 
                  onClick={() => handleCategoryClick('productos')} 
                  className="block w-full text-left text-foreground hover:text-lilac-dark py-2 transition-colors pl-4"
                >
                  Ver todo
                </button>
              </div>

              <a 
                href={`https://wa.me/${siteInfo.whatsappNumber.replace(/\+/g, '')}?text=Quiero%20personalizar%20mi%20propio%20estilo`}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={toggleMobileMenu}
                className="text-foreground hover:text-lilac-dark py-2 transition-colors"
              >
                Personalización
              </a>

              {isAuthenticated && isAdmin ? (
                <Link to="/admin" onClick={toggleMobileMenu} className="text-foreground hover:text-lilac-dark py-2 transition-colors">
                  Panel de Administración
                </Link>
              ) : null}
              
              {isAuthenticated ? (
                <button onClick={() => { logout(); toggleMobileMenu(); }} className="text-foreground hover:text-lilac-dark py-2 transition-colors text-left">
                  Cerrar Sesión
                </button>
              ) : (
                <Link to="/login" onClick={toggleMobileMenu} className="text-foreground hover:text-lilac-dark py-2 transition-colors">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <Cart isOpen={isCartOpen} onClose={toggleCart} />
      
      <div className="h-[70px]"></div>
    </>
  );
};

export default Navbar;
