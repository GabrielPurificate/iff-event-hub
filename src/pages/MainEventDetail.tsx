import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEvents } from '@/contexts/EventsContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import QRCodeDialog from '@/components/QRCodeDialog';

const MainEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getEventById, 
    getSubEvents, 
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getUserEvents,
    joinWaitlist,
    leaveWaitlist,
    isUserInWaitlist
  } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('all');

  if (!id) {
    return <div>Evento principal não encontrado</div>;
  }

  const mainEvent = getEventById(id);
  const subEvents = getSubEvents(id);
  const userEvents = user ? getUserEvents(user.id) : [];

  if (!mainEvent) {
    return <div>Evento principal não encontrado</div>;
  }

  const mainEventDates = mainEvent.schedule ? [...new Set(mainEvent.schedule.map(s => s.date))] : [];

  const filteredSubEvents = selectedDate === 'all' 
    ? subEvents 
    : subEvents.filter(subEvent => subEvent.schedule.some(s => s.date === selectedDate));

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
        description: "Não foi possível realizar a inscrição. Verifique se há conflito de horário com outros eventos em que você já está inscrito ou se o evento está lotado.",
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

  const handleJoinWaitlist = (eventId: string) => {
    if (!user) return;
    joinWaitlist(eventId, user.id);
    toast({ title: "Você entrou na fila de espera" });
  };

  const handleLeaveWaitlist = (eventId: string) => {
    if (!user) return;
    leaveWaitlist(eventId, user.id);
    toast({ title: "Você saiu da fila de espera" });
  };

  const isUserRegistered = (eventId: string) => {
    return user ? userEvents.some(e => e.id === eventId) : false;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {mainEvent.imageUrl && (
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={mainEvent.imageUrl} 
                alt={mainEvent.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
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
              <div className="space-y-2 mb-4">
                {Array.isArray(mainEvent.schedule) && mainEvent.schedule.map((s, i) => (
                  <div key={i} className="flex items-center space-x-4 text-sm">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })} - {s.startTime} às {s.endTime}
                    </span>
                  </div>
                ))}
              </div>
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
                  <QRCodeDialog url={window.location.href} eventName={mainEvent.title} />
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Sub-eventos</h2>
              {mainEventDates.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant={selectedDate === 'all' ? 'default' : 'outline'} onClick={() => setSelectedDate('all')}>Todos</Button>
                  {mainEventDates.map(date => (
                    <Button 
                      key={date} 
                      variant={selectedDate === date ? 'default' : 'outline'}
                      onClick={() => setSelectedDate(date)}
                    >
                      {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {filteredSubEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSubEvents.map(subEvent => (
                  <EventCard 
                    key={subEvent.id} 
                    event={subEvent} 
                    showRegisterButton={true}
                    isRegistered={isUserRegistered(subEvent.id)}
                    isInWaitlist={user ? isUserInWaitlist(subEvent.id, user.id) : false}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                    onJoinWaitlist={handleJoinWaitlist}
                    onLeaveWaitlist={handleLeaveWaitlist}
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
