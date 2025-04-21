import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../integrations/supabase/client';

const PrivacyPolicy: React.FC = () => {
  const [title, setTitle] = useState('Política de Privacidad');
  const [content, setContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacyPolicyData();
  }, []);

  const loadPrivacyPolicyData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_info')
        .select('privacy_policy_title, privacy_policy_content, privacy_policy_last_updated')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al cargar datos:', error);
        setDefaultContent();
        return;
      }

      if (data && data.privacy_policy_content) {
        if (data.privacy_policy_title) setTitle(data.privacy_policy_title);
        setContent(data.privacy_policy_content);
        if (data.privacy_policy_last_updated) setLastUpdated(data.privacy_policy_last_updated);
      } else {
        setDefaultContent();
      }
    } catch (error) {
      console.error('Error al cargar política de privacidad:', error);
      setDefaultContent();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultContent = () => {
    // Conteúdo padrão se não houver dados no banco
    setContent(`
      <p>
        En GrafiModa, valoramos y respetamos tu privacidad. Esta política de privacidad explica 
        de manera simple cómo recopilamos, utilizamos y protegemos tu información cuando visitas 
        nuestro sitio web.
      </p>
      
      <h2>Información que recopilamos</h2>
      <ul>
        <li>
          <strong>Información básica de navegación:</strong> Recopilamos datos estándar de 
          navegación como dirección IP, tipo de navegador y páginas visitadas para mejorar 
          tu experiencia en nuestro sitio.
        </li>
        <li>
          <strong>Información de carrito:</strong> Guardamos los productos que añades a tu 
          carrito para facilitar tu proceso de compra.
        </li>
      </ul>
      
      <h2>Uso de cookies</h2>
      <p>
        Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Las cookies son pequeños 
        archivos de texto que se almacenan en tu dispositivo cuando visitas nuestra web. Estas nos 
        ayudan a:
      </p>
      <ul>
        <li>Recordar tus preferencias y productos en el carrito</li>
        <li>Entender cómo interactúas con nuestro sitio</li>
        <li>Mejorar la velocidad y seguridad de la navegación</li>
      </ul>
      
      <h2>Cómo utilizamos tu información</h2>
      <p>
        La información que recopilamos nos ayuda a:
      </p>
      <ul>
        <li>Procesar tus pedidos y personalizar productos</li>
        <li>Mejorar nuestro sitio web y servicios</li>
        <li>Comunicarnos contigo sobre tu pedido o consultas</li>
      </ul>
      
      <h2>Compartir información</h2>
      <p>
        No vendemos ni compartimos tu información personal con terceros para fines de marketing. 
        Solo compartimos información necesaria con proveedores de servicios que nos ayudan a 
        operar nuestro sitio y procesar pedidos.
      </p>
      
      <h2>Seguridad</h2>
      <p>
        Implementamos medidas de seguridad apropiadas para proteger tu información contra 
        acceso no autorizado o alteración.
      </p>
      
      <h2>Tus derechos</h2>
      <p>
        Tienes derecho a:
      </p>
      <ul>
        <li>Acceder a la información que tenemos sobre ti</li>
        <li>Solicitar la corrección de información inexacta</li>
        <li>Solicitar que eliminemos tu información</li>
      </ul>
      
      <h2>Contacto</h2>
      <p>
        Si tienes preguntas sobre nuestra política de privacidad, puedes contactarnos a través de 
        nuestro WhatsApp o correo electrónico.
      </p>
    `);
    setLastUpdated(new Date().toLocaleDateString());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container-custom mx-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h1>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <div 
                  className="prose prose-lg mx-auto"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                
                {lastUpdated && (
                  <p className="text-sm text-gray-500 mt-8 text-center">
                    Última actualización: {lastUpdated}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 