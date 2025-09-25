import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import EventCard from '@/components/EventCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { getMainEvents, registerForEvent, unregisterFromEvent, getUserEvents } = useEvents();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const mainEvents = getMainEvents();
  const userEvents = user ? getUserEvents(user.id) : [];

  const filteredEvents = mainEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegister = (eventId: string) => {
    if (!user) return;
    
    const success = registerForEvent(eventId, user.id);
    if (success) {
      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito no evento com sucesso.",
      });
    } else {
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível realizar a inscrição. O evento pode estar lotado.",
        variant: "destructive",
      });
    }
  };

  const handleUnregister = (eventId: string) => {
    if (!user) return;
    
    unregisterFromEvent(eventId, user.id);
    toast({
      title: "Inscrição cancelada",
      description: "Sua inscrição foi cancelada com sucesso.",
    });
  };

  const isUserRegistered = (eventId: string) => {
    return user ? userEvents.some(e => e.id === eventId) : false;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Bem-vindo ao IFF Eventos, {user.name}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra e participe dos melhores eventos do Campus Itaperuna. 
            Conecte-se, aprenda e cresça junto com nossa comunidade acadêmica.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{mainEvents.length} eventos principais</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>{userEvents.length} suas inscrições</span>
            </div>
          </div>

            {user.role === 'organizer' && (
            <Button asChild variant="hero" className="mt-4">
              <Link to="/create-event">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Evento
              </Link>
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar eventos por título, descrição ou organizador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              Eventos Principais
              <Badge variant="secondary" className="ml-2">
                {filteredEvents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="my-events">
              Minhas Inscrições
              <Badge variant="secondary" className="ml-2">
                {userEvents.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento próximo'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente buscar com outros termos.'
                    : 'Novos eventos serão adicionados em breve.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={isUserRegistered(event.id)}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                    linkTo={`/event/main/${event.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6 mt-6">
            {userEvents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Você ainda não está inscrito em nenhum evento
                </h3>
                <p className="text-muted-foreground mb-4">
                  Explore os eventos disponíveis e faça sua inscrição!
                </p>
                <Button onClick={() => setSearchTerm('')}>
                  Ver Todos os Eventos
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {userEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showRegisterButton={true}
                    isRegistered={true}
                    onUnregister={handleUnregister}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;