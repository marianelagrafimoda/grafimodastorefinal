import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

const TestCookies: React.FC = () => {
  // Limpa o localStorage quando a página carrega
  useEffect(() => {
    localStorage.removeItem('cookieConsent');
  }, []);

  const clearConsent = () => {
    localStorage.removeItem('cookieConsent');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container-custom mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Página de Prueba de Cookies</h1>
            
            <div className="prose prose-lg mx-auto mb-8">
              <p>
                Esta página es para probar el banner de consentimiento de cookies.
                El localStorage se limpia automáticamente al cargar esta página.
              </p>
              <p>
                Si no ves el banner de cookies en la parte inferior de la pantalla, 
                haz clic en el botón a continuación para limpiar el consentimiento 
                y recargar la página.
              </p>
            </div>
            
            <Button 
              onClick={clearConsent} 
              className="bg-lilac hover:bg-lilac-dark text-white"
            >
              Limpiar Consentimiento y Recargar
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TestCookies; 