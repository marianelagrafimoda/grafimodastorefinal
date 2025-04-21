import React, { useState, useEffect } from 'react';
import { X, Save, Package, Palette, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Product, Color } from '../contexts/ProductContext';
import ProductImagesUploader from './ProductImagesUploader';

interface ProductEditorProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
  onImageUpload: (file: File) => Promise<string>;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ 
  product, 
  onSave, 
  onCancel, 
  onImageUpload 
}) => {
  const [editingProduct, setEditingProduct] = useState<Product>({...product});
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FFFFFF');
  const [newAdultSizeName, setNewAdultSizeName] = useState('');
  const [newChildSizeName, setNewChildSizeName] = useState('');
  const [newChildAgeSize, setNewChildAgeSize] = useState('');

  useEffect(() => {
    if (!editingProduct.images) {
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.imageUrl ? [editingProduct.imageUrl] : []
      });
    }
  }, []);

  const handleImagesChange = (newImages: string[]) => {
    setEditingProduct({
      ...editingProduct,
      images: newImages,
      imageUrl: newImages.length > 0 ? newImages[0] : ''
    });
  };

  const handleAddColor = () => {
    if (newColorName && newColorHex) {
      const colorId = newColorName.toLowerCase().replace(/\s+/g, '-');
      const newColors = [
        ...editingProduct.colors,
        { id: colorId, name: newColorName, hex: newColorHex }
      ];
      setEditingProduct({...editingProduct, colors: newColors});
      setNewColorName('');
      setNewColorHex('#FFFFFF');
    }
  };

  const handleRemoveColor = (colorId: string) => {
    const newColors = editingProduct.colors.filter(color => color.id !== colorId);
    setEditingProduct({...editingProduct, colors: newColors});
  };

  const toggleSizeAvailability = (sizeId: string) => {
    const updatedSizes = editingProduct.sizes.map(size => 
      size.id === sizeId ? { ...size, available: !size.available } : size
    );
    setEditingProduct({...editingProduct, sizes: updatedSizes});
  };

  const handleAddAdultSize = () => {
    if (newAdultSizeName) {
      const sizeId = `adult-${newAdultSizeName.toLowerCase().replace(/\s+/g, '-')}`;
      if (!editingProduct.sizes.some(size => size.id === sizeId)) {
        const newSizes = [
          ...editingProduct.sizes,
          { id: sizeId, name: newAdultSizeName, available: true, isChildSize: false }
        ];
        setEditingProduct({...editingProduct, sizes: newSizes});
        setNewAdultSizeName('');
      }
    }
  };

  const handleAddChildSize = () => {
    if (newChildSizeName) {
      const sizeId = `child-${newChildSizeName.toLowerCase().replace(/\s+/g, '-')}`;
      if (!editingProduct.sizes.some(size => size.id === sizeId)) {
        const newSizes = [
          ...editingProduct.sizes,
          { id: sizeId, name: newChildSizeName, available: true, isChildSize: true }
        ];
        setEditingProduct({...editingProduct, sizes: newSizes});
        setNewChildSizeName('');
      }
    }
  };

  const handleAddChildAgeSize = () => {
    if (newChildAgeSize && !isNaN(parseInt(newChildAgeSize)) && parseInt(newChildAgeSize) >= 1 && parseInt(newChildAgeSize) <= 12) {
      const age = parseInt(newChildAgeSize);
      const sizeId = `child-age-${age}`;
      
      if (!editingProduct.sizes.some(size => size.id === sizeId)) {
        const newSizes = [
          ...editingProduct.sizes,
          { 
            id: sizeId, 
            name: `${age} año${age !== 1 ? 's' : ''}`, 
            available: true, 
            isChildSize: true 
          }
        ];
        setEditingProduct({...editingProduct, sizes: newSizes});
        setNewChildAgeSize('');
      }
    }
  };

  const handleRemoveSize = (sizeId: string) => {
    const newSizes = editingProduct.sizes.filter(size => size.id !== sizeId);
    setEditingProduct({...editingProduct, sizes: newSizes});
  };

  const handleSave = () => {
    if (!editingProduct.title || editingProduct.price <= 0) {
      return;
    }
    onSave(editingProduct);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Imágenes del producto</label>
        <div className="mt-2">
          <ProductImagesUploader 
            images={editingProduct.images || []}
            onImagesChange={handleImagesChange}
            onImageUpload={onImageUpload}
            maxImages={6}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Título</label>
        <Input
          value={editingProduct.title}
          onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
          className="border-lilac/30 mt-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Precio ($)</label>
          <Input
            type="number"
            value={editingProduct.price || ''}
            onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
            min="0"
            step="0.01"
            className="border-lilac/30 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Stock</label>
          <Input
            type="number"
            value={editingProduct.stockQuantity || ''}
            onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value) || 0})}
            min="0"
            className="border-lilac/30 mt-1"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Descripción</label>
        <Input
          value={editingProduct.description}
          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
          className="border-lilac/30 mt-1"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium flex items-center">
          <Palette className="w-4 h-4 mr-2" />
          Color de la tarjeta
        </label>
        <div className="flex items-center mt-1 space-x-2">
          <input
            type="color"
            value={editingProduct.cardColor}
            onChange={(e) => setEditingProduct({...editingProduct, cardColor: e.target.value})}
            className="w-8 h-8 rounded border"
          />
          <Input
            value={editingProduct.cardColor}
            onChange={(e) => setEditingProduct({...editingProduct, cardColor: e.target.value})}
            className="border-lilac/30 w-28"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Tallas disponibles</label>
        <div className="mt-2 space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Adultos:</p>
            <div className="flex flex-wrap gap-2">
              {editingProduct.sizes.filter(size => !size.isChildSize).map(size => (
                <div key={size.id} className="flex items-center bg-gray-100 rounded-lg text-sm">
                  <button
                    onClick={() => toggleSizeAvailability(size.id)}
                    className={`px-2 py-1 rounded-l-lg ${
                      size.available
                        ? 'bg-lilac text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {size.name}
                  </button>
                  <button
                    onClick={() => handleRemoveSize(size.id)}
                    className="px-1 text-gray-500 hover:text-red-500 rounded-r-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex mt-2">
              <Input
                value={newAdultSizeName}
                onChange={(e) => setNewAdultSizeName(e.target.value)}
                placeholder="Nueva talla adulto"
                className="border-lilac/30 text-sm max-w-[180px]"
              />
              <Button 
                size="sm" 
                onClick={handleAddAdultSize}
                className="ml-2 bg-lilac hover:bg-lilac-dark"
                disabled={!newAdultSizeName}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Niños:</p>
            <div className="flex flex-wrap gap-2">
              {editingProduct.sizes.filter(size => size.isChildSize).map(size => (
                <div key={size.id} className="flex items-center bg-gray-100 rounded-lg text-sm">
                  <button
                    onClick={() => toggleSizeAvailability(size.id)}
                    className={`px-2 py-1 rounded-l-lg ${
                      size.available
                        ? 'bg-lilac text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {size.name}
                  </button>
                  <button
                    onClick={() => handleRemoveSize(size.id)}
                    className="px-1 text-gray-500 hover:text-red-500 rounded-r-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex mt-2">
              <Input
                value={newChildSizeName}
                onChange={(e) => setNewChildSizeName(e.target.value)}
                placeholder="Nueva talla niño"
                className="border-lilac/30 text-sm max-w-[180px]"
              />
              <Button 
                size="sm" 
                onClick={handleAddChildSize}
                className="ml-2 bg-lilac hover:bg-lilac-dark"
                disabled={!newChildSizeName}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex mt-2">
              <Input
                type="number"
                min="1"
                max="12"
                value={newChildAgeSize}
                onChange={(e) => setNewChildAgeSize(e.target.value)}
                placeholder="Edad (1-12 años)"
                className="border-lilac/30 text-sm max-w-[180px]"
              />
              <Button 
                size="sm" 
                onClick={handleAddChildAgeSize}
                className="ml-2 bg-lilac hover:bg-lilac-dark"
                disabled={!newChildAgeSize || isNaN(parseInt(newChildAgeSize)) || parseInt(newChildAgeSize) < 1 || parseInt(newChildAgeSize) > 12}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Colores disponibles</label>
        <div className="mt-2 flex flex-wrap gap-1">
          {editingProduct.colors.map((color: Color) => (
            <div key={color.id} className="flex items-center text-xs bg-gray-100 p-1 rounded">
              <div 
                className="w-4 h-4 rounded-full mr-1" 
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
              <button 
                onClick={() => handleRemoveColor(color.id)}
                className="ml-1 text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <Input
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            placeholder="Nombre"
            className="border-lilac/30 w-full text-sm"
          />
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-8 h-8 rounded border"
            />
            <Button 
              size="sm"
              onClick={handleAddColor}
              className="bg-lilac hover:bg-lilac-dark"
              disabled={!newColorName}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button 
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-1" />
          Guardar
        </Button>
        <Button 
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          <X className="w-4 h-4 mr-1" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default ProductEditor;
