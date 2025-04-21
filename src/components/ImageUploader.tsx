
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { setupDatabase } from '../lib/supabase';
import { logAdminActivity } from '../lib/admin-activity-logger';
import { useAuth } from '../contexts/AuthContext';

interface ImageUploaderProps {
  onImageUpload: (file: File) => Promise<string>;
  label?: string;
  accept?: string;
  maxSize?: number; // em MB
  bucketType?: 'site_images' | 'product_images';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  label = "Subir imagen",
  accept = "image/*",
  maxSize = 10, // Aumentamos para 10MB
  bucketType = 'site_images'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Verificar a configuração do banco de dados ao montar o componente
  React.useEffect(() => {
    setupDatabase().catch(error => {
      console.error("Erro ao configurar o banco de dados a partir do ImageUploader:", error);
      setUploadError("Erro de configuração do armazenamento. Tente novamente mais tarde.");
    });
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (in bytes)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "Arquivo muito grande",
        description: `O tamanho máximo permitido é ${maxSize}MB.`,
        variant: "destructive"
      });
      return;
    }
    
    // Create temporary URL for preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      setIsUploading(true);
      
      // Upload the image
      const imageUrl = await onImageUpload(file);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Registra a atividade se for um administrador
      if (user && user.isAdmin) {
        await logAdminActivity({
          adminEmail: user.email,
          actionType: 'create',
          entityType: bucketType === 'site_images' ? 'carousel_image' : 'product',
          details: {
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            bucket: bucketType
          }
        });
      }
      
      toast({
        title: "Imagem enviada com sucesso",
        description: "A imagem foi enviada corretamente."
      });
      
      return imageUrl;
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      
      // More specific message depending on error type
      let errorMessage = "Ocorreu um erro ao enviar a imagem. Tente novamente.";
      
      if (error instanceof Error) {
        console.log("Detalhes do erro:", error.message);
        
        // Mensagens específicas para diferentes tipos de erros
        if (error.message.includes('bucket')) {
          errorMessage = `Erro no bucket ${bucketType}: ${error.message}`;
          setUploadError(errorMessage);
        } else if (error.message.includes('storage')) {
          errorMessage = `Erro de armazenamento: não foi possível acessar o bucket ${bucketType}.`;
          setUploadError(errorMessage);
        } else if (error.message.includes('conexão')) {
          errorMessage = "Falha na conexão com o servidor de armazenamento. Verifique sua conexão à internet.";
          setUploadError(errorMessage);
        } else {
          errorMessage = `Erro ao acessar o armazenamento ${bucketType}. Verifique sua conexão e tente novamente.`;
          setUploadError(errorMessage);
        }
      }
      
      toast({
        title: "Erro ao enviar imagem",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsUploading(false);
      // Release temporary URL
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const cancelPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retrySetup = async () => {
    setUploadError(null);
    try {
      const success = await setupDatabase();
      if (success) {
        toast({
          title: "Configuração concluída",
          description: "O sistema de armazenamento foi configurado com sucesso."
        });
      } else {
        throw new Error("Não foi possível configurar o armazenamento");
      }
    } catch (error) {
      console.error("Erro ao reconfigurar o banco de dados:", error);
      setUploadError(`Falha na reconfiguração do bucket ${bucketType}. Tente novamente mais tarde.`);
      toast({
        title: "Erro de configuração",
        description: "Não foi possível configurar o sistema de armazenamento.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-2">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{uploadError}</span>
          <Button
            onClick={retrySetup}
            variant="destructive"
            size="sm"
            className="mt-2"
          >
            Tentar novamente
          </Button>
        </div>
      )}
      
      {!preview ? (
        <Button
          type="button"
          onClick={triggerFileSelect}
          disabled={isUploading}
          variant="outline"
          className="w-full h-32 flex flex-col items-center justify-center border-dashed border-2 border-lilac/50 bg-transparent hover:bg-lilac/5"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 mb-2 text-lilac animate-spin" />
          ) : (
            <Upload className="h-6 w-6 mb-2 text-lilac" />
          )}
          <span className="text-sm text-center">
            {isUploading ? "Enviando..." : label}
            <br />
            <span className="text-xs text-gray-500">
              Tamanho máximo: {maxSize}MB
            </span>
          </span>
        </Button>
      ) : (
        <div className="relative border rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-32 object-cover"
          />
          <button
            onClick={cancelPreview}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Enviando...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
