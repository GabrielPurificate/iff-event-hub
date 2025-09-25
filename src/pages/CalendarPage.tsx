import { useState } from 'react';
import { useEvents } from '@/contexts/EventsContext';
import Header from '@/components/Header';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const CalendarPage = () => {
  const { events } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const eventsByDate = events.reduce((acc, event) => {
    if (Array.isArray(event.schedule)) {
      event.schedule.forEach(s => {
        const date = new Date(s.date + 'T00:00:00').toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        if (!acc[date].find(e => e.id === event.id)) {
          acc[date].push(event);
        }
      });
    }
    return acc;
  }, {} as Record<string, typeof events>);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const eventsForSelectedDate = eventsByDate[selectedDateString] || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side: Calendar */}
          <div className="flex-1 lg:max-w-md xl:max-w-lg">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-full"
                  modifiers={{
                    event: Object.keys(eventsByDate).map(dateString => new Date(dateString + 'T00:00:00'))
                  }}
                  modifiersClassNames={{
                    event: 'event-date',
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right side: Event List */}
          <div className="flex-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {selectedDate ? `Eventos em ${selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}` : 'Selecione uma data'}
              </h2>
              
              {selectedDate && eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map(event => {
                    const isMainEvent = !event.parentId;
                    const linkTo = isMainEvent ? `/event/main/${event.id}` : `/event/${event.id}`;
                    return (
                      <Link to={linkTo} key={event.id} className="block">
                        <Card className="hover:border-primary transition-colors duration-300 bg-gradient-card-secondary shadow-card">
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-foreground">{event.title}</p>
                                <Badge variant={isMainEvent ? 'default' : 'secondary'}>
                                  {isMainEvent ? 'Principal' : 'Sub-evento'}
                                </Badge>
                              </div>
                              {Array.isArray(event.schedule) && event.schedule.map((s, i) => (
                                <p key={i} className="text-sm text-muted-foreground">{new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} - {s.startTime} às {s.endTime}</p>
                              ))}
                              {event.category && <Badge variant="outline" className="mt-2">{event.category}</Badge>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">{selectedDate ? 'Nenhum evento encontrado' : 'Nenhum evento para hoje'}</h3>
                  <p className="text-muted-foreground text-sm">Selecione uma data no calendário para ver os eventos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;