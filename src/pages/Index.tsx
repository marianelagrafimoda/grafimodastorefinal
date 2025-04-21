import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Gem, Palette, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import WhatsAppButton from '../components/WhatsAppButton';
import { useProducts } from '../contexts/ProductContext';
import { useSiteInfo } from '../contexts/SiteContext';

const Index: React.FC = () => {
  const location = useLocation();
  const { products } = useProducts();
  const { siteInfo } = useSiteInfo();

  useEffect(() => {
    const state = location.state as { scrollTo?: string };
    if (state?.scrollTo) {
      const element = document.getElementById(state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Clean up the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Carousel */}
      <ProductCarousel />
      
      {/* Featured Products Section */}
      <section id="productos" className="py-16">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              {siteInfo.productsTitle}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">{siteInfo.productsSubtitle}</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              {siteInfo.productsDescription}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Sections */}
      <section id="camisetas" className="py-16 bg-gray-50">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Camisetas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(product => 
              product.title.toLowerCase().includes('camiseta') || 
              product.description.toLowerCase().includes('camiseta')
            ).map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sudaderas" className="py-16">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Sudaderas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(product => 
              product.title.toLowerCase().includes('sudadera') || 
              product.description.toLowerCase().includes('sudadera')
            ).map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cojines" className="py-16 bg-gray-50">
        <div className="container-custom mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center mb-8">Cojines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.filter(product => 
              product.title.toLowerCase().includes('cojin') || 
              product.description.toLowerCase().includes('cojin') ||
              product.title.toLowerCase().includes('cojín') || 
              product.description.toLowerCase().includes('cojín')
            ).map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              Por qué elegirnos
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">La mejor calidad garantizada</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group">
                <Gem className="w-8 h-8 text-lilac-dark transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">{siteInfo.materialsTitle}</h3>
              <p className="text-gray-600">
                {siteInfo.materialsDescription}
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group">
                <Palette className="w-8 h-8 text-lilac-dark transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">{siteInfo.designTitle}</h3>
              <p className="text-gray-600">
                {siteInfo.designDescription}
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="bg-lilac/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group">
                <Users className="w-8 h-8 text-lilac-dark transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">{siteInfo.serviceTitle}</h3>
              <p className="text-gray-600">
                {siteInfo.serviceDescription}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-lilac/5">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-lilac/10 text-lilac-dark text-sm font-medium rounded-full mb-2">
              Preguntas Frecuentes
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">{siteInfo.faqTitle}</h2>
          </div>
          
          <div className="max-w-3xl mx-auto divide-y divide-lilac/20">
            {siteInfo.faqItems?.map((faq, index) => (
              <div className="py-5" key={index}>
                <h3 className="font-medium text-lg flex items-center">
                  <span className="text-lilac-dark mr-2">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                  {faq.question}
                </h3>
                <p className="mt-2 text-gray-600 pl-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom mx-auto">
          <div className="bg-gradient-to-r from-lilac to-lilac-dark rounded-xl p-8 md:p-12 text-center text-white">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para personalizar tu estilo?
            </h2>
            <p className="max-w-2xl mx-auto mb-8">
              Contáctanos ahora y comienza a crear prendas únicas que reflejen tu personalidad y estilo.
            </p>
            <div className="flex justify-center">
              <WhatsAppButton className="bg-white text-black hover:bg-gray-100" />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
