import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../integrations/supabase/client';

type Stat = {
  value: string;
  title: string;
  description: string;
};

const AboutUs = () => {
  const [title, setTitle] = useState('Nuestra Historia');
  const [description, setDescription] = useState<string>('');
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAboutUsData();
  }, []);

  const loadAboutUsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_info')
        .select('about_us_title, about_us_description, about_us_stats')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al cargar datos:', error);
        return;
      }

      if (data) {
        if (data.about_us_title) setTitle(data.about_us_title);
        
        if (data.about_us_description) {
          setDescription(data.about_us_description);
        } else {
          // Fallback para descrição
          setDescription('En GrafiModa, nos apasiona transformar tus ideas en prendas únicas que reflejen tu personalidad. Somos un equipo dedicado a la creación de productos personalizados de alta calidad, combinando creatividad con las mejores tecnologías de impresión.\n\nNuestra misión es hacer que cada prenda sea especial, trabajando estrechamente con nuestros clientes para crear diseños que cuenten historias y expresen individualidad.');
        }
        
        if (data.about_us_stats) {
          try {
            const statsData = typeof data.about_us_stats === 'string' 
              ? JSON.parse(data.about_us_stats) 
              : data.about_us_stats;
            
            if (Array.isArray(statsData) && statsData.length > 0) {
              setStats(statsData);
            } else {
              // Fallback para estatísticas
              setDefaultStats();
            }
          } catch (e) {
            console.error('Error al procesar estadísticas:', e);
            setDefaultStats();
          }
        } else {
          setDefaultStats();
        }
      } else {
        // Sem dados, usar valores padrão
        setDefaultStats();
      }
    } catch (error) {
      console.error('Error al cargar datos de Quiénes Somos:', error);
      setDefaultStats();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultStats = () => {
    setStats([
      {
        value: '5+',
        title: 'Años de Experiencia',
        description: 'Creando productos personalizados de calidad'
      },
      {
        value: '1000+',
        title: 'Clientes Satisfechos',
        description: 'Confiando en nuestro trabajo'
      },
      {
        value: '100%',
        title: 'Personalización',
        description: 'Diseños únicos para cada cliente'
      }
    ]);
  };

  // Formata a descrição para exibir parágrafos
  const formatDescription = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      paragraph.trim() && <p key={index} className="text-gray-600 mb-4">{paragraph}</p>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              Quiénes Somos
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">{title}</h1>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="prose prose-lg">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : (
                formatDescription(description)
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {loading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="text-center animate-pulse">
                    <div className="bg-gray-200 w-16 h-16 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                ))
              ) : (
                stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-lilac-dark">{stat.value}</span>
                    </div>
                    <h3 className="font-medium text-lg mb-2">{stat.title}</h3>
                    <p className="text-gray-600">{stat.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
