
import React, { useState } from 'react';
import { X, Upload, Loader2, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

interface ProductImagesUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onImageUpload: (file: File) => Promise<string>;
  maxImages?: number;
}

const ProductImagesUploader: React.FC<ProductImagesUploaderProps> = ({ 
  images, 
  onImagesChange, 
  onImageUpload,
  maxImages = 6
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding more images would exceed the maximum
    if (images.length + files.length > maxImages) {
      toast({
        title: "Límite de imágenes",
        description: `Solo se pueden agregar hasta ${maxImages} imágenes por producto.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Tipo de archivo no válido",
            description: "Solo se permiten archivos de imagen.",
            variant: "destructive",
            duration: 3000,
          });
          continue;
        }
        
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Archivo demasiado grande",
            description: "El tamaño máximo de archivo es 10MB.",
            variant: "destructive",
            duration: 3000,
          });
          continue;
        }
        
        const imageUrl = await onImageUpload(file);
        onImagesChange([...images, imageUrl]);
        
        toast({
          title: "Imagen agregada",
          description: "La imagen se ha agregado correctamente.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error al subir imagen",
        description: "Ocurrió un error al subir la imagen. Intente nuevamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Display existing images */}
        {images.map((image, index) => (
          <div key={index} className="relative h-32 border rounded-md overflow-hidden group">
            <img 
              src={image} 
              alt={`Imagen ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-1">
                {index > 0 && (
                  <button 
                    onClick={() => moveImage(index, index - 1)}
                    className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-200"
                    title="Mover a la izquierda"
                  >
                    ←
                  </button>
                )}
                
                <button 
                  onClick={() => removeImage(index)}
                  className="p-1 bg-white rounded-full text-red-500 hover:bg-red-100"
                  title="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {index < images.length - 1 && (
                  <button 
                    onClick={() => moveImage(index, index + 1)}
                    className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-200"
                    title="Mover a la derecha"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
            
            {/* First image label */}
            {index === 0 && (
              <div className="absolute top-0 left-0 bg-lilac text-white text-xs px-1 rounded-br">
                Principal
              </div>
            )}
          </div>
        ))}
        
        {/* Add new image */}
        {images.length < maxImages && (
          <div 
            className="h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-lilac transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-lilac animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-gray-400" />
                <p className="text-xs text-gray-500 mt-2">Agregar imagen</p>
              </>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        multiple
        disabled={isUploading || images.length >= maxImages}
      />
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {images.length} de {maxImages} imágenes (La primera será la principal)
        </p>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
        >
          <Upload className="h-3 w-3 mr-1" />
          Subir {images.length > 0 ? 'más' : ''} imágenes
        </Button>
      </div>
    </div>
  );
};

export default ProductImagesUploader;
