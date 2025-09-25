import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEvents } from '@/contexts/EventsContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

const MainEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getEventById, 
    getSubEvents, 
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getUserEvents 
  } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!id) {
    return <div>Evento principal não encontrado</div>;
  }

  const mainEvent = getEventById(id);
  const subEvents = getSubEvents(id);
  const userEvents = user ? getUserEvents(user.id) : [];

  if (!mainEvent) {
    return <div>Evento principal não encontrado</div>;
  }

  const isOrganizer = user?.id === mainEvent.organizerId;

  const handleDelete = () => {
    deleteEvent(id);
    toast({ title: "Evento deletado com sucesso!" });
    navigate('/dashboard');
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl lg:text-3xl">{mainEvent.title}</CardTitle>
              {mainEvent.category && (
                <Badge variant="secondary" className="w-fit">
                  {mainEvent.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {mainEvent.description}
              </p>
              {isOrganizer && (
                <div className="flex space-x-4 mt-4">
                  <Button asChild>
                    <Link to={`/event/main/${id}/edit`}>Editar</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Deletar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Deletar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Sub-eventos</h2>
            {subEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subEvents.map(subEvent => (
                  <EventCard 
                    key={subEvent.id} 
                    event={subEvent} 
                    showRegisterButton={true}
                    isRegistered={isUserRegistered(subEvent.id)}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum sub-evento encontrado para este evento principal.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainEventDetail;
