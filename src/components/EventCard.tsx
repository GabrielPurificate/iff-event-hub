import { Event } from '@/contexts/EventsContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
  showRegisterButton?: boolean;
  isRegistered?: boolean;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  linkTo?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  showRegisterButton = false,
  isRegistered = false,
  onRegister,
  onUnregister,
  linkTo,
}) => {
  const isUpcoming = Array.isArray(event.schedule) && event.schedule.some(s => {
    const [year, month, day] = s.date.split('-').map(Number);
    const [hour, minute] = s.startTime.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hour, minute);
    const now = new Date('2024-09-25T00:00:00');
    return eventDate > now;
  });
  const isFull = event.maxAttendees ? event.attendees.length >= event.maxAttendees : false;

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRegistered && onUnregister) {
      onUnregister(event.id);
    } else if (onRegister) {
      onRegister(event.id);
    }
  };

  return (
    <Card className="group hover:shadow-hover transition-all duration-300 bg-gradient-card border-0">
      <Link to={linkTo || `/event/${event.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {event.title}
              </CardTitle>
              {event.category && (
                <Badge variant="secondary" className="text-xs">
                  {event.category}
                </Badge>
              )}
            </div>
            {!isUpcoming && (
              <Badge variant="outline" className="ml-2">
                Finalizado
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2">
            {event.schedule && event.schedule[0] && (
              <>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {new Date(event.schedule[0].date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  {event.schedule[0].startTime} - {event.schedule[0].endTime}
                </div>
              </>
            )}

            {event.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {event.location}
              </div>
            )}

            <div className="flex items-center text-sm text-muted-foreground">
              <User className="w-4 h-4 mr-2 text-primary" />
              {event.organizer}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-2 text-primary" />
              {event.attendees.length} inscritos
              {event.maxAttendees && ` / ${event.maxAttendees}`}
            </div>
          </div>
        </CardContent>

        {showRegisterButton && isUpcoming && (
          <CardFooter className="pt-3">
            <Button
              onClick={handleRegisterClick}
              className="w-full shadow-button"
              variant={isRegistered ? "outline" : "default"}
              disabled={!isRegistered && isFull}
            >
              {isFull && !isRegistered ? (
                'Evento Lotado'
              ) : isRegistered ? (
                'Cancelar Inscrição'
              ) : (
                'Inscrever-se'
              )}
            </Button>
          </CardFooter>
        )}
      </Link>
    </Card>
  );
};

export default EventCard;