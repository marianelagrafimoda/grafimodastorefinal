import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import { logAdminActivity } from '../../lib/admin-activity-logger';
import { supabase } from '../../integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type Stat = {
  value: string;
  title: string;
  description: string;
};

const AboutUsEditor = () => {
  const [title, setTitle] = useState('Nuestra Historia');
  const [description, setDescription] = useState(
    'En GrafiModa, nos apasiona transformar tus ideas en prendas únicas que reflejen tu personalidad. Somos un equipo dedicado a la creación de productos personalizados de alta calidad, combinando creatividad con las mejores tecnologías de impresión.\n\nNuestra misión es hacer que cada prenda sea especial, trabajando estrechamente con nuestros clientes para crear diseños que cuenten historias y expresen individualidad.'
  );
  const [stats, setStats] = useState<Stat[]>([
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAboutUsData();
  }, []);

  const loadAboutUsData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_info')
        .select('about_us_title, about_us_description, about_us_stats')
        .single();

      if (error) throw error;

      if (data) {
        if (data.about_us_title) setTitle(data.about_us_title);
        if (data.about_us_description) setDescription(data.about_us_description);
        
        if (data.about_us_stats) {
          // Assegura que about_us_stats é um array de estatísticas
          try {
            const statsData = typeof data.about_us_stats === 'string' 
              ? JSON.parse(data.about_us_stats) 
              : data.about_us_stats;
            
            if (Array.isArray(statsData) && statsData.length > 0) {
              setStats(statsData);
            }
          } catch (e) {
            console.error('Erro ao processar estatísticas:', e);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de Quiénes Somos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Obtém ID do registro atual ou cria um novo
      const { data: existingData, error: fetchError } = await supabase
        .from('site_info')
        .select('id')
        .limit(1);

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const recordId = existingData && existingData.length > 0 
        ? existingData[0].id 
        : undefined;

      const updateData = {
        about_us_title: title,
        about_us_description: description,
        about_us_stats: stats
      };

      let result;
      if (recordId) {
        // Atualiza registro existente
        result = await supabase
          .from('site_info')
          .update(updateData)
          .eq('id', recordId);
      } else {
        // Insere novo registro se não existir (raro, mas possível)
        result = await supabase
          .from('site_info')
          .insert(updateData);
      }

      if (result.error) throw result.error;

      await logAdminActivity({
        adminEmail: (await supabase.auth.getUser()).data.user?.email || '',
        actionType: 'update',
        entityType: 'site_info',
        details: {
          section: 'about_us',
          fields_updated: ['title', 'description', 'stats']
        }
      });

      toast({
        title: "¡Actualizado!",
        description: "La página 'Quiénes Somos' ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStat = () => {
    setStats([
      ...stats,
      {
        value: '',
        title: '',
        description: ''
      }
    ]);
  };

  const handleRemoveStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const handleStatChange = (index: number, field: keyof Stat, value: string) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Editar Quiénes Somos</CardTitle>
        <CardDescription>
          Actualice el contenido de la página "Quiénes Somos"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Contenido Principal</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-lilac/30 mt-1"
                placeholder="Título de la sección"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 p-2 border border-lilac/30 rounded-md min-h-[250px]"
                placeholder="Descripción detallada de Quiénes Somos"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puede usar saltos de línea para estructurar mejor el texto.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Estadísticas Destacadas</h3>
              <Button 
                onClick={handleAddStat}
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Añadir
              </Button>
            </div>
            
            {stats.map((stat, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Estadística {index + 1}</h4>
                  <Button
                    onClick={() => handleRemoveStat(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 h-8 px-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Valor</label>
                    <Input
                      value={stat.value}
                      onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                      className="border-lilac/30 mt-1"
                      placeholder="Ej: 5+"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={stat.title}
                      onChange={(e) => handleStatChange(index, 'title', e.target.value)}
                      className="border-lilac/30 mt-1"
                      placeholder="Ej: Años de Experiencia"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <Input
                      value={stat.description}
                      onChange={(e) => handleStatChange(index, 'description', e.target.value)}
                      className="border-lilac/30 mt-1"
                      placeholder="Breve descripción"
                    />
                  </div>
                </div>
              </div>
            ))}

            {stats.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No hay estadísticas añadidas. Haga clic en "Añadir" para crear una.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave}
          className="w-full bg-lilac hover:bg-lilac-dark"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AboutUsEditor;
