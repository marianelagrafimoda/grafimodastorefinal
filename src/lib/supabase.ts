import { supabase } from '../integrations/supabase/client';
import { verifyAndCreateBuckets } from './admin-activity-logger';
import { Json } from '../integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

// Configuração global - verifica e configura o banco de dados
export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Verifica a conexão com o Supabase
    const { error: connectionError } = await supabase
      .from('site_info')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error("Erro de conexão com Supabase:", connectionError);
      return false;
    }
    
    // Verifica e cria os buckets necessários
    const bucketsSetup = await verifyAndCreateBuckets();
    if (!bucketsSetup) {
      return false;
    }
    
    // Verifica a tabela de pedidos
    const { error: pedidosError } = await supabase
      .from('pedidos')
      .select('count', { count: 'exact', head: true });
    
    // Se houver erro, é provável que a tabela não exista (para verificação apenas)
    if (pedidosError) {
      console.warn("A tabela de pedidos pode não existir:", pedidosError);
      // Continua a execução mesmo com erro na verificação
    }
    
    console.log("Configuração do banco de dados concluída com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao configurar o banco de dados:", error);
    return false;
  }
};

/**
 * Faz upload de uma imagem para o bucket especificado
 */
export const uploadImage = async (file: File, bucketName: string = 'site_images', prefix: string = ''): Promise<string> => {
  try {
    // Verifica se o banco de dados está configurado
    await setupDatabase();
    
    // Gera um nome único para o arquivo usando UUID
    const fileExt = file.name.split('.').pop();
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = prefix ? `${prefix}${fileName}` : fileName;
    
    // Upload da imagem
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error(`Erro ao fazer upload para ${bucketName}:`, uploadError);
      throw uploadError;
    }
    
    // Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Erro durante upload para ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Remove uma imagem do bucket especificado
 */
export const removeImage = async (imageUrl: string, bucketName: string = 'site_images'): Promise<boolean> => {
  try {
    // Extrair o caminho do arquivo da URL
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const filePath = pathSegments[pathSegments.length - 1];
    
    // Remover a imagem
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) {
      console.error(`Erro ao remover imagem de ${bucketName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao remover imagem de ${bucketName}:`, error);
    return false;
  }
};

/**
 * Salva informações do site
 */
export const saveSiteInfo = async (siteInfo: any): Promise<boolean> => {
  try {
    // Garantir que temos um array de imagens válido
    if (typeof siteInfo.carousel_images === 'string') {
      try {
        siteInfo.carousel_images = JSON.parse(siteInfo.carousel_images);
      } catch {
        siteInfo.carousel_images = [];
      }
    } else if (!Array.isArray(siteInfo.carousel_images)) {
      siteInfo.carousel_images = [];
    }
    
    // Garantir que temos um array de FAQs válido
    if (typeof siteInfo.faq_items === 'string') {
      try {
        siteInfo.faq_items = JSON.parse(siteInfo.faq_items);
      } catch {
        siteInfo.faq_items = [];
      }
    } else if (!Array.isArray(siteInfo.faq_items)) {
      siteInfo.faq_items = [];
    }
    
    // Verificar se já existe um registro
    const { data: existingData, error: fetchError } = await supabase
      .from('site_info')
      .select('id')
      .limit(1);
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao verificar site_info existente:', fetchError);
      throw fetchError;
    }
    
    let result;
    if (existingData && existingData.length > 0) {
      // Atualiza registro existente
      result = await supabase
        .from('site_info')
        .update(siteInfo)
        .eq('id', existingData[0].id);
    } else {
      // Insere novo registro
      result = await supabase
        .from('site_info')
        .insert(siteInfo);
    }
    
    if (result.error) {
      console.error('Erro ao salvar informações do site:', result.error);
      throw result.error;
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao salvar informações do site:', error);
    return false;
  }
};

/**
 * Obtém imagens do carrossel
 */
export const getCarouselImages = async (): Promise<string[]> => {
  try {
    // Tenta obter imagens do banco de dados
    const { data: siteInfo, error: dbError } = await supabase
      .from('site_info')
      .select('carousel_images')
      .maybeSingle();
    
    if (!dbError && siteInfo && siteInfo.carousel_images) {
      // Se encontrou no banco, retorna as imagens
      let images = siteInfo.carousel_images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [];
        }
      }
      
      // Garantir que todos os valores são strings e retornar array vazio se não for array
      return Array.isArray(images) ? images.map(item => String(item)) : [];
    }
    
    // Se não encontrou no banco ou teve erro, retorna array vazio
    return [];
  } catch (error) {
    console.error('Erro ao obter imagens do carrossel:', error);
    return [];
  }
};

/**
 * Limpar imagens do carrossel (remove todas as imagens anteriores)
 */
export const clearCarouselImages = async (): Promise<boolean> => {
  try {
    // Obter o registro atual
    const { data: existingData, error: fetchError } = await supabase
      .from('site_info')
      .select('id')
      .limit(1);
      
    if (fetchError) {
      console.error('Erro ao verificar site_info para limpar imagens:', fetchError);
      return false;
    }
    
    if (existingData && existingData.length > 0) {
      // Atualiza o registro para ter um array vazio de imagens
      const result = await supabase
        .from('site_info')
        .update({ carousel_images: [] })
        .eq('id', existingData[0].id);
        
      if (result.error) {
        console.error('Erro ao limpar imagens do carrossel:', result.error);
        return false;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Falha ao limpar imagens do carrossel:', error);
    return false;
  }
};

/**
 * Atualiza um pedido existente no banco de dados
 */
export const updatePedido = async (pedidoId: string, pedidoData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pedidos')
      .update({
        ...pedidoData,
        updated_at: new Date().toISOString()
      })
      .eq('id', pedidoId);
      
    if (error) {
      console.error('Erro ao atualizar pedido:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Falha ao atualizar pedido:', error);
    return false;
  }
};
