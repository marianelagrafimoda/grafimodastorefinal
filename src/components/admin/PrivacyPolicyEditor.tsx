import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { logAdminActivity } from '../../lib/admin-activity-logger';
import { supabase } from '../../integrations/supabase/client';

const PrivacyPolicyEditor: React.FC = () => {
  const [title, setTitle] = useState('Política de Privacidad');
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleDateString());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrivacyPolicyData();
  }, []);

  const loadPrivacyPolicyData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_info')
        .select('privacy_policy_title, privacy_policy_content, privacy_policy_last_updated')
        .single();

      if (error) throw error;

      if (data) {
        if (data.privacy_policy_title) setTitle(data.privacy_policy_title);
        if (data.privacy_policy_content) setContent(data.privacy_policy_content);
        if (data.privacy_policy_last_updated) setLastUpdated(data.privacy_policy_last_updated);
      }
    } catch (error) {
      console.error('Error al cargar política de privacidad:', error);
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

      const currentDate = new Date().toLocaleDateString();
      
      const updateData = {
        privacy_policy_title: title,
        privacy_policy_content: content,
        privacy_policy_last_updated: currentDate
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

      setLastUpdated(currentDate);

      await logAdminActivity({
        adminEmail: (await supabase.auth.getUser()).data.user?.email || '',
        actionType: 'update',
        entityType: 'site_info',
        details: {
          section: 'privacy_policy',
          fields_updated: ['title', 'content', 'last_updated']
        }
      });

      toast({
        title: "¡Actualizado!",
        description: "La Política de Privacidad ha sido actualizada exitosamente",
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Editar Política de Privacidad</CardTitle>
        <CardDescription>
          Actualice el contenido de la página de Política de Privacidad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 p-2 border border-lilac/30 rounded-md"
            placeholder="Título de la política de privacidad"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Contenido</label>
          <p className="text-xs text-gray-500 mt-1 mb-2">
            Puede usar HTML básico para formatear el texto. Use &lt;h2&gt; para títulos, &lt;p&gt; para párrafos, &lt;ul&gt; y &lt;li&gt; para listas.
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full mt-1 p-2 border border-lilac/30 rounded-md min-h-[400px] font-mono text-sm"
            placeholder="Contenido de la política de privacidad (puede usar HTML básico para formatear)"
          />
        </div>
        
        <div>
          <p className="text-sm text-gray-500">
            Última actualización: {lastUpdated}
          </p>
          <p className="text-xs text-gray-500">
            Esta fecha se actualizará automáticamente al guardar los cambios.
          </p>
        </div>
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

export default PrivacyPolicyEditor; 