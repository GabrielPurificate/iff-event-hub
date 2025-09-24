import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getEventById, registerForEvent, unregisterFromEvent, getUserEvents } = useEvents();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!id || !user) {
    return <div>Evento não encontrado</div>;
  }

  const event = getEventById(id);
  const userEvents = getUserEvents(user.id);
  const isRegistered = userEvents.some(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Evento não encontrado</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(`${event.date}T${event.time}`);
  const isUpcoming = eventDate > new Date();
  const isFull = event.maxAttendees ? event.attendees.length >= event.maxAttendees : false;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegister = () => {
    if (isRegistered) {
      unregisterFromEvent(event.id, user.id);
      toast({
        title: "Inscrição cancelada",
        description: "Sua inscrição foi cancelada com sucesso.",
      });
    } else {
      const success = registerForEvent(event.id, user.id);
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
    }
  };

  const getRegistrationStatus = () => {
    if (!isUpcoming) {
      return {
        icon: <XCircle className="w-5 h-5" />,
        text: "Evento Finalizado",
        variant: "outline" as const,
        disabled: true
      };
    }
    
    if (isRegistered) {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        text: "Cancelar Inscrição",
        variant: "outline" as const,
        disabled: false
      };
    }
    
    if (isFull) {
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        text: "Evento Lotado",
        variant: "outline" as const,
        disabled: true
      };
    }
    
    return {
      icon: <Users className="w-5 h-5" />,
      text: "Inscrever-se",
      variant: "default" as const,
      disabled: false
    };
  };

  const registrationStatus = getRegistrationStatus();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Detalhes do Evento</span>
          </div>

          {/* Back Button */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <CardTitle className="text-2xl lg:text-3xl">{event.title}</CardTitle>
                      {event.category && (
                        <Badge variant="secondary" className="w-fit">
                          {event.category}
                        </Badge>
                      )}
                    </div>
                    
                    {!isUpcoming && (
                      <Badge variant="outline" className="w-fit">
                        Evento Finalizado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Data</p>
                          <p className="text-muted-foreground capitalize">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Horário</p>
                          <p className="text-muted-foreground">
                            {formatTime(event.time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {event.location && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Local</p>
                            <p className="text-muted-foreground">{event.location}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Organizador</p>
                          <p className="text-muted-foreground">{event.organizer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Inscrições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Participantes</span>
                    <span className="text-sm text-muted-foreground">
                      {event.attendees.length}
                      {event.maxAttendees && ` / ${event.maxAttendees}`}
                    </span>
                  </div>

                  {event.maxAttendees && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((event.attendees.length / event.maxAttendees) * 100, 100)}%` }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleRegister}
                    disabled={registrationStatus.disabled}
                    variant={registrationStatus.variant}
                    className="w-full shadow-button"
                  >
                    {registrationStatus.icon}
                    <span className="ml-2">{registrationStatus.text}</span>
                  </Button>

                  {isRegistered && isUpcoming && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        ✓ Você está inscrito neste evento
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Event Info */}
              <Card className="bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criado em</span>
                    <span>{event.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={isUpcoming ? "text-success" : "text-muted-foreground"}>
                      {isUpcoming ? "Em breve" : "Finalizado"}
                    </span>
                  </div>
                  
                  {event.maxAttendees && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vagas disponíveis</span>
                      <span className={isFull ? "text-warning" : "text-success"}>
                        {event.maxAttendees - event.attendees.length}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;