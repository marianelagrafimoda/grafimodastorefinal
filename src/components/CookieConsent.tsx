import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from './ui/button';

const CookieConsent: React.FC = () => {
  // Defina como true por padrão e depois verifique o localStorage
  const [showConsent, setShowConsent] = useState(true);

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies
    const consentAccepted = localStorage.getItem('cookieConsent');
    // Se já aceitou, esconde o banner
    if (consentAccepted === 'true' || consentAccepted === 'false') {
      setShowConsent(false);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowConsent(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowConsent(false);
  };

  // Se não mostrar o consentimento, não renderiza nada
  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 p-4 border-t border-lilac/20">
      <div className="container-custom mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍪</span>
          <p className="text-sm text-gray-700">
            Usamos cookies para mejorar tu experiencia. Consulta nuestra{' '}
            <Link to="/privacidad" className="text-lilac-dark underline">
              Política de Privacidad
            </Link>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={acceptCookies}
            className="bg-lilac hover:bg-lilac-dark text-white"
          >
            Aceptar
          </Button>
          <Button 
            onClick={rejectCookies}
            variant="outline"
            className="border-lilac text-lilac hover:bg-lilac/10"
          >
            Rechazar
          </Button>
          <button 
            onClick={acceptCookies} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 