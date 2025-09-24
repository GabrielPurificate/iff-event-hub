import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Plus } from 'lucide-react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CreateEvent = () => {
  const { user } = useAuth();
  const { addEvent } = useEvents();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    maxAttendees: '',
  });

  const [loading, setLoading] = useState(false);

  // Redirect if user is not an organizer
  if (!user || user.role !== 'organizer') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const eventDate = new Date(`${formData.date}T${formData.time}`);
    if (eventDate <= new Date()) {
      toast({
        title: "Data inválida",
        description: "O evento deve ser agendado para uma data futura.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addEvent({
        ...formData,
        organizer: user.name,
        organizerId: user.id,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
      });

      toast({
        title: "Evento criado com sucesso!",
        description: "O evento foi adicionado e está disponível para inscrições.",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro ao criar evento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Criar Evento</span>
          </div>

          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Criar Novo Evento</h1>
            <p className="text-muted-foreground">
              Preencha as informações do evento para disponibilizá-lo para inscrições
            </p>
          </div>

          {/* Form */}
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-primary" />
                <span>Informações do Evento</span>
              </CardTitle>
              <CardDescription>
                Todos os campos marcados com * são obrigatórios
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título do Evento *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Workshop de React.js"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descrição *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva o evento, objetivos, metodologia, público-alvo..."
                    rows={4}
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Data *</span>
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Horário *</span>
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Location and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Local</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ex: Auditório Principal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Categoria
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Ex: Tecnologia, Palestra, Workshop"
                    />
                  </div>
                </div>

                {/* Max Attendees */}
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees" className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Número máximo de participantes</span>
                  </Label>
                  <Input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    value={formData.maxAttendees}
                    onChange={handleInputChange}
                    placeholder="Deixe vazio para sem limite"
                    min="1"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 shadow-button"
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : 'Criar Evento'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateEvent;