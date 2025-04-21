
import { supabase } from '../integrations/supabase/client';

// Tipos de ações possíveis
export type ActionType = 'create' | 'update' | 'delete' | 'login' | 'logout';

// Tipos de entidades que podem ser modificadas
export type EntityType = 'site_info' | 'product' | 'carousel_image' | 'user' | 'session';

interface LogActivityProps {
  adminEmail: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, any>;
}

/**
 * Registra uma atividade realizada por um administrador
 */
export const logAdminActivity = async ({
  adminEmail,
  actionType,
  entityType,
  entityId,
  details
}: LogActivityProps): Promise<boolean> => {
  try {
    // Verifica se é o super admin
    const isSuperAdmin = adminEmail === 'marianela.grafimoda@gmail.com';
    
    const { error } = await supabase
      .from('admin_activity_logs')
      .insert({
        admin_email: adminEmail,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {}
      });

    if (error) {
      console.error('Erro ao registrar atividade do admin:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Erro ao registrar atividade do admin:', err);
    return false;
  }
};

/**
 * Verifica se os buckets necessários existem e os cria se necessário
 */
export const verifyAndCreateBuckets = async (): Promise<boolean> => {
  try {
    const requiredBuckets = ['site_images', 'product_images'];
    
    for (const bucketName of requiredBuckets) {
      // Verifica se o bucket existe
      const { data: existingBuckets } = await supabase
        .storage
        .listBuckets();
      
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
      
      // Se não existir, cria o bucket
      if (!bucketExists) {
        const { error } = await supabase
          .storage
          .createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024 // 10MB
          });
        
        if (error) {
          console.error(`Erro ao criar bucket ${bucketName}:`, error);
          return false;
        }
        
        // Adiciona políticas para o bucket
        // Nota: Este código seria executado via SQL normalmente
        // mas estamos usando a API para simplificar
        console.log(`Bucket ${bucketName} criado com sucesso!`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Erro ao verificar/criar buckets:', err);
    return false;
  }
};
