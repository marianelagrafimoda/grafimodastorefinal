import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteInfo } from '../contexts/SiteContext';
import { Facebook, Instagram, MapPin, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const { siteInfo } = useSiteInfo();
  const currentYear = new Date().getFullYear();
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const whatsappUrl = `https://wa.me/593990893095`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className="bg-lilac/10 py-10 mt-10">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <a 
              href="#" 
              onClick={handleLogoClick}
              className="flex items-center space-x-2"
            >
              <img src={siteInfo.footerLogoUrl || "/lovable-uploads/9ecb5286-6e91-4b1e-9ea2-f2bb91f4df50.png"} alt="GrafiModa" className="h-10" />
            </a>
            <p className="text-gray-600">{siteInfo.slogan}</p>
            
            {/* Social Media Buttons */}
            <div className="flex items-center space-x-3 mt-4">
              <a 
                href={siteInfo.facebookLink || "https://facebook.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-lilac hover:bg-lilac-dark text-white rounded-full p-2 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href={siteInfo.instagramLink || "https://instagram.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-lilac hover:bg-lilac-dark text-white rounded-full p-2 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {siteInfo.footerAboutText && (
              <div className="mt-4">
                <p className="text-gray-600">{siteInfo.footerAboutText}</p>
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-medium text-lg mb-4">{siteInfo.footerLinksTitle || "Enlaces Rápidos"}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/#productos" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <a 
                  href={`https://wa.me/593990893095?text=Quiero%20personalizar%20mi%20propio%20estilo`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-lilac-dark transition-colors"
                >
                  Personalización
                </a>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-gray-600 hover:text-lilac-dark transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              {siteInfo.footerCustomLinks && siteInfo.footerCustomLinks.map((link, index) => (
                <li key={`custom-link-${index}`}>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-lilac-dark transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-serif font-medium text-lg mb-4">{siteInfo.footerContactTitle || "Contacto"}</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-lilac-dark" />
                <a 
                  href={`https://wa.me/593990893095`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-lilac-dark transition-colors"
                >
                  +593990893095
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-lilac-dark" />
                <a 
                  href={`mailto:${siteInfo.emailAddress || "marianela.grafimoda@gmail.com"}`} 
                  className="text-gray-600 hover:text-lilac-dark transition-colors"
                >
                  {siteInfo.emailAddress || "marianela.grafimoda@gmail.com"}
                </a>
              </li>
              {siteInfo.address && (
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-2 mt-0.5 text-lilac-dark" />
                  <span className="text-gray-600">{siteInfo.address}</span>
                </li>
              )}
            </ul>

            {siteInfo.footerAdditionalInfo && (
              <div className="mt-4 pt-4 border-t border-lilac/20">
                <p className="text-sm text-gray-600">{siteInfo.footerAdditionalInfo}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-lilac/20 mt-8 pt-6 text-center text-gray-600 text-sm">
          <p>{siteInfo.footerCopyrightText || `© ${currentYear} GrafiModa. Todos los derechos reservados.`}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
