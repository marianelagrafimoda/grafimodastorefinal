
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useSiteInfo } from '../../contexts/SiteContext';
import { useToast } from '../../hooks/use-toast';

interface FaqItem {
  question: string;
  answer: string;
}

const FaqEditor: React.FC = () => {
  const { siteInfo, updateSiteInfo } = useSiteInfo();
  const { toast } = useToast();
  
  // Inicializar con los datos de siteInfo o con valores predeterminados
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqTitle, setFaqTitle] = useState('');
  
  // Actualizar el estado cuando cambian los datos en siteInfo
  useEffect(() => {
    if (siteInfo) {
      setFaqTitle(siteInfo.faqTitle || 'Todo lo que necesitas saber');
      
      if (siteInfo.faqItems && Array.isArray(siteInfo.faqItems)) {
        setFaqItems(siteInfo.faqItems);
      } else {
        // Valores predeterminados si no hay datos
        setFaqItems([
          { question: '', answer: '' },
          { question: '', answer: '' },
          { question: '', answer: '' },
          { question: '', answer: '' }
        ]);
      }
    }
  }, [siteInfo]);
  
  const handleAddFaq = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };
  
  const handleRemoveFaq = (index: number) => {
    if (faqItems.length > 1) {
      const newFaqItems = [...faqItems];
      newFaqItems.splice(index, 1);
      setFaqItems(newFaqItems);
    } else {
      toast({
        title: "Error al eliminar",
        description: "Debe haber al menos una pregunta frecuente",
        variant: "destructive",
      });
    }
  };
  
  const updateQuestion = (index: number, value: string) => {
    const newFaqItems = [...faqItems];
    newFaqItems[index].question = value;
    setFaqItems(newFaqItems);
  };
  
  const updateAnswer = (index: number, value: string) => {
    const newFaqItems = [...faqItems];
    newFaqItems[index].answer = value;
    setFaqItems(newFaqItems);
  };
  
  const handleSaveFaqs = async () => {
    // Validar que todos los campos estén completos
    const isEmpty = faqItems.some(item => !item.question.trim() || !item.answer.trim());
    
    if (isEmpty) {
      toast({
        title: "Error al guardar",
        description: "Todos los campos de preguntas y respuestas deben estar completos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Guardar tanto el título como los elementos FAQ
      await updateSiteInfo({
        faqTitle,
        faqItems
      });
      
      toast({
        title: "Preguntas frecuentes actualizadas",
        description: "Los cambios han sido guardados correctamente",
      });
    } catch (error) {
      console.error("Error al guardar las FAQ:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Editar Preguntas Frecuentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Título de la sección
          </label>
          <Input 
            value={faqTitle}
            onChange={(e) => setFaqTitle(e.target.value)}
            placeholder="Título de la sección FAQ"
            className="w-full"
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Preguntas y respuestas</h3>
          
          {faqItems.map((faq, index) => (
            <div key={index} className="p-4 border rounded-md space-y-3 relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleRemoveFaq(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pregunta {index + 1}
                </label>
                <Input 
                  value={faq.question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder="Escribe la pregunta aquí"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Respuesta {index + 1}
                </label>
                <Textarea 
                  value={faq.answer}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  placeholder="Escribe la respuesta aquí"
                  className="w-full"
                  rows={3}
                />
              </div>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleAddFaq}
          >
            <Plus className="mr-2 h-4 w-4" /> Añadir nueva pregunta
          </Button>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSaveFaqs}
          className="w-full bg-lilac hover:bg-lilac-dark"
        >
          Guardar cambios
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FaqEditor;
