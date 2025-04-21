
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { 
  Package, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Phone,
  MapPin,
  User,
  DollarSign,
  FileText,
  RefreshCcw,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

// Definir la interfaz para los pedidos
interface Pedido {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  valor: number;
  descripcion: string;
  estado: string;
  created_at: string;
}

const PedidosManager: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [valor, setValor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  // Estado para edición de pedidos
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Cargar pedidos al montar el componente
  useEffect(() => {
    fetchPedidos();
  }, []);
  
  // Función para cargar los pedidos desde Supabase
  const fetchPedidos = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setPedidos(data || []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para crear un nuevo pedido
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre || !telefono || !direccion || !valor || !descripcion) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validar que el valor sea un número
      const valorNumerico = parseFloat(valor);
      if (isNaN(valorNumerico)) {
        throw new Error('El valor debe ser un número válido');
      }
      
      // Crear pedido en Supabase
      const { data, error } = await supabase
        .from('pedidos')
        .insert([
          {
            nombre,
            telefono,
            direccion,
            valor: valorNumerico,
            descripcion,
            estado: 'pendiente'
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Actualizar lista de pedidos
      if (data) {
        setPedidos([data[0], ...pedidos]);
      }
      
      // Limpiar formulario
      setNombre('');
      setTelefono('');
      setDireccion('');
      setValor('');
      setDescripcion('');
      
      toast({
        title: '¡Éxito!',
        description: 'Pedido registrado correctamente',
      });
    } catch (error: any) {
      console.error('Error al crear pedido:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el pedido',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para eliminar un pedido
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este pedido?')) {
      try {
        const { error } = await supabase
          .from('pedidos')
          .delete()
          .eq('id', id);
          
        if (error) {
          throw error;
        }
        
        // Actualizar lista de pedidos
        setPedidos(pedidos.filter(pedido => pedido.id !== id));
        
        toast({
          title: 'Pedido eliminado',
          description: 'El pedido ha sido eliminado correctamente',
        });
      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el pedido',
          variant: 'destructive',
        });
      }
    }
  };
  
  // Función para actualizar el estado de un pedido
  const updateEstado = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Actualizar la lista de pedidos
      setPedidos(pedidos.map(pedido => 
        pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido
      ));
      
      toast({
        title: 'Estado actualizado',
        description: `El pedido ahora está ${nuevoEstado}`,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        variant: 'destructive',
      });
    }
  };
  
  // Función para comenzar a editar un pedido
  const startEditing = (pedido: Pedido) => {
    setEditingId(pedido.id);
    setEditNombre(pedido.nombre);
    setEditTelefono(pedido.telefono);
    setEditDireccion(pedido.direccion);
    setEditValor(pedido.valor.toString());
    setEditDescripcion(pedido.descripcion);
  };
  
  // Función para cancelar la edición
  const cancelEditing = () => {
    setEditingId(null);
  };
  
  // Función para guardar los cambios del pedido editado
  const saveEditing = async () => {
    if (!editNombre || !editTelefono || !editDireccion || !editValor || !editDescripcion) {
      toast({
        title: 'Error',
        description: 'Todos los campos son obligatorios',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const valorNumerico = parseFloat(editValor);
      if (isNaN(valorNumerico)) {
        throw new Error('El valor debe ser un número válido');
      }
      
      const { error } = await supabase
        .from('pedidos')
        .update({
          nombre: editNombre,
          telefono: editTelefono,
          direccion: editDireccion,
          valor: valorNumerico,
          descripcion: editDescripcion,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);
        
      if (error) {
        throw error;
      }
      
      // Actualizar la lista de pedidos
      setPedidos(pedidos.map(pedido => 
        pedido.id === editingId 
          ? { 
              ...pedido, 
              nombre: editNombre,
              telefono: editTelefono,
              direccion: editDireccion,
              valor: valorNumerico,
              descripcion: editDescripcion
            } 
          : pedido
      ));
      
      setEditingId(null);
      
      toast({
        title: '¡Actualizado!',
        description: 'Pedido actualizado correctamente',
      });
    } catch (error: any) {
      console.error('Error al actualizar pedido:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el pedido',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Formato de fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Crear enlace de WhatsApp
  const getWhatsAppLink = (phone: string) => {
    // Limpiar el número de teléfono quitando caracteres no numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-lilac/20">
        <CardHeader>
          <CardTitle className="font-serif">Registrar Nuevo Pedido</CardTitle>
          <CardDescription>
            Complete el formulario para registrar un nuevo pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Nombre del Cliente
                </label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre completo"
                  className="border-lilac/30 focus:border-lilac"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Teléfono (WhatsApp)
                </label>
                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: +593990893095"
                  className="border-lilac/30 focus:border-lilac"
                  required
                />
                <p className="text-xs text-gray-500">Incluya el código de país con el signo +</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Dirección de Entrega
              </label>
              <Input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección completa"
                className="border-lilac/30 focus:border-lilac"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Valor ($)
              </label>
              <Input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="border-lilac/30 focus:border-lilac"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Descripción del Pedido
              </label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles del producto, cantidad, especificaciones, etc."
                className="border-lilac/30 focus:border-lilac min-h-[100px]"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-lilac hover:bg-lilac-dark" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Pedido
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-md border-lilac/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif">Lista de Pedidos</CardTitle>
            <CardDescription>
              Pedidos registrados y su estado
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPedidos}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-lilac" />
              <p className="mt-2 text-gray-500">Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">No hay pedidos registrados</p>
              <p className="text-sm text-gray-400">Los pedidos que registres aparecerán aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      {editingId === pedido.id ? (
                        <TableCell colSpan={6}>
                          <div className="space-y-3 p-2 border rounded-md bg-gray-50">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium">Nombre</label>
                                <Input 
                                  value={editNombre}
                                  onChange={(e) => setEditNombre(e.target.value)}
                                  className="mt-1 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium">Teléfono</label>
                                <Input 
                                  value={editTelefono}
                                  onChange={(e) => setEditTelefono(e.target.value)}
                                  className="mt-1 text-sm"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Dirección</label>
                              <Input 
                                value={editDireccion}
                                onChange={(e) => setEditDireccion(e.target.value)}
                                className="mt-1 text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Valor ($)</label>
                              <Input 
                                type="number"
                                value={editValor}
                                onChange={(e) => setEditValor(e.target.value)}
                                min="0"
                                step="0.01"
                                className="mt-1 text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium">Descripción</label>
                              <Textarea 
                                value={editDescripcion}
                                onChange={(e) => setEditDescripcion(e.target.value)}
                                className="mt-1 text-sm min-h-[80px]"
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={saveEditing}
                                disabled={isSaving}
                                className="bg-lilac hover:bg-lilac-dark"
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Save className="h-4 w-4 mr-1" />
                                )}
                                Guardar
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      ) : (
                        <>
                          <TableCell className="font-mono text-xs">
                            {formatDate(pedido.created_at)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {pedido.nombre}
                          </TableCell>
                          <TableCell>
                            <a 
                              href={getWhatsAppLink(pedido.telefono)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:underline"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {pedido.telefono}
                            </a>
                          </TableCell>
                          <TableCell>
                            ${parseFloat(pedido.valor.toString()).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              pedido.estado === 'completado' 
                                ? 'bg-green-100 text-green-800' 
                                : pedido.estado === 'cancelado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pedido.estado}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(pedido)}
                                title="Editar pedido"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateEstado(pedido.id, 'completado')}
                                disabled={pedido.estado === 'completado'}
                                title="Marcar como completado"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateEstado(pedido.id, 'cancelado')}
                                disabled={pedido.estado === 'cancelado'}
                                title="Marcar como cancelado"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(pedido.id)}
                                title="Eliminar pedido"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidosManager;
