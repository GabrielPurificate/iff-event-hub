import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  schedule: ScheduleEntry[];
  organizer: string;
  organizerId: string;
  attendees: string[];
  maxAttendees?: number;
  location?: string;
  category?: string;
  createdAt: Date;
  parentId?: string;
  imageUrl?: string;
  waitlist?: string[];
}

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'waitlist'>) => void;
  updateEvent: (eventId: string, eventData: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  registerForEvent: (eventId: string, userId: string) => boolean;
  unregisterFromEvent: (eventId: string, userId: string) => void;
  joinWaitlist: (eventId: string, userId: string) => void;
  leaveWaitlist: (eventId: string, userId: string) => void;
  isUserInWaitlist: (eventId: string, userId: string) => boolean;
  getEventById: (id: string) => Event | undefined;
  getUserEvents: (userId: string) => Event[];
  getUpcomingEvents: () => Event[];
  getMainEvents: () => Event[];
  getSubEvents: (parentId: string) => Event[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

interface EventsProviderProps {
  children: ReactNode;
}

const currentYear = new Date().getFullYear();

const mockEvents: Event[] = [
  {
    id: '1',
    title: `Semana de Tecnologia ${currentYear}`,
    description: 'Uma semana completa de palestras, workshops e hackathons sobre as mais novas tecnologias.',
    schedule: [
      { date: `${currentYear}-10-15`, startTime: '08:00', endTime: '17:00' },
      { date: `${currentYear}-10-16`, startTime: '08:00', endTime: '17:00' },
      { date: `${currentYear}-10-17`, startTime: '08:00', endTime: '17:00' },
      { date: `${currentYear}-10-18`, startTime: '08:00', endTime: '12:00' },
    ],
    organizer: 'Coordenação de TADS',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 500,
    location: 'IFF Campos Centro',
    category: 'Tecnologia',
    createdAt: new Date(`${currentYear}-09-01`),
    parentId: undefined,
    waitlist: [],
  },
  {
    id: '2',
    title: 'Workshop de React e Node.js',
    description: 'Aprenda a desenvolver aplicações modernas com React no frontend e Node.js no backend.',
    schedule: [
      { date: `${currentYear}-10-15`, startTime: '14:00', endTime: '18:00' },
    ],
    organizer: 'Prof. Maria Santos',
    organizerId: 'organizer-id',
    attendees: ['user3'],
    maxAttendees: 30,
    location: 'Laboratório de Informática 1',
    category: 'Programação',
    createdAt: new Date(`${currentYear}-09-05`),
    parentId: '1',
    waitlist: [],
  },
  {
    id: '3',
    title: 'Palestra sobre Inteligência Artificial',
    description: 'Descubra o futuro da IA e suas aplicações no mercado de trabalho.',
    schedule: [
      { date: `${currentYear}-10-16`, startTime: '10:00', endTime: '12:00' },
    ],
    organizer: 'Prof. Carlos Pereira',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 100,
    location: 'Auditório Principal',
    category: 'Inteligência Artificial',
    createdAt: new Date(`${currentYear}-09-06`),
    parentId: '1',
    waitlist: [],
  },
  {
    id: '4',
    title: 'Hackathon de 2 dias',
    description: 'Resolva um problema real em 2 dias de programação intensa.',
    schedule: [
      { date: `${currentYear}-10-15`, startTime: '18:00', endTime: '19:50' },
      { date: `${currentYear}-10-17`, startTime: '18:00', endTime: '22:00' },
    ],
    organizer: 'Prof. Ana Souza',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 25,
    location: 'Laboratório de Redes',
    category: 'DevOps',
    createdAt: new Date(`${currentYear}-09-07`),
    parentId: '1',
    waitlist: [],
  },
  {
    id: '5',
    title: 'Introdução ao Docker',
    description: 'Aprenda os conceitos básicos de Docker e como containerizar suas aplicações.',
    schedule: [
      { date: `${currentYear}-10-16`, startTime: '14:00', endTime: '16:00' },
    ],
    organizer: 'Prof. João Silva',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 40,
    location: 'Laboratório de Informática 2',
    category: 'DevOps',
    createdAt: new Date(`${currentYear}-09-08`),
    parentId: '1',
    waitlist: [],
  },
  {
    id: '6',
    title: 'Palestra sobre Segurança da Informação',
    description: 'Entenda os principais desafios e como se proteger no mundo digital.',
    schedule: [
      { date: `${currentYear}-10-16`, startTime: '10:30', endTime: '11:30' },
    ],
    organizer: 'Especialista em Segurança Convidado',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 100,
    location: 'Auditório Secundário',
    category: 'Segurança',
    createdAt: new Date(`${currentYear}-09-09`),
    parentId: '1',
    waitlist: [],
  },
  {
    id: '7',
    title: 'Oficina de Design Thinking',
    description: 'Uma abordagem prática para resolver problemas de forma criativa e inovadora.',
    schedule: [
      { date: `${currentYear}-10-17`, startTime: '09:00', endTime: '12:00' },
    ],
    organizer: 'Designer Joana Lima',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 25,
    location: 'Sala de Reuniões 1',
    category: 'Inovação',
    createdAt: new Date(`${currentYear}-09-10`),
    parentId: '1',
    waitlist: [],
  }
];

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('iff-events');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((event: Event) => ({
        ...event,
        createdAt: new Date(event.createdAt),
        waitlist: event.waitlist || [],
      }));
    }
    return mockEvents;
  });

  // Save to localStorage whenever events change
  React.useEffect(() => {
    localStorage.setItem('iff-events', JSON.stringify(events));
  }, [events]);

  const addEvent = (eventData: Omit<Event, 'id' | 'attendees' | 'createdAt' | 'waitlist'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      attendees: [],
      createdAt: new Date(),
      waitlist: [],
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (eventId: string, eventData: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...eventData } : e));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const getMainEvents = () => events.filter(e => !e.parentId);

  const getSubEvents = (parentId: string) => events.filter(e => e.parentId === parentId);

  const registerForEvent = (eventId: string, userId: string): boolean => {
    const eventToRegister = events.find(e => e.id === eventId);
    if (!eventToRegister) return false;

    if (eventToRegister.attendees.includes(userId)) return false;

    if (eventToRegister.maxAttendees && eventToRegister.attendees.length >= eventToRegister.maxAttendees) {
      return false; // Event is full
    }

    const userEvents = events.filter(e => e.attendees.includes(userId));

    for (const userEvent of userEvents) {
      for (const userSchedule of userEvent.schedule) {
        for (const newSchedule of eventToRegister.schedule) {
          if (userSchedule.date === newSchedule.date) {
            const userStart = new Date(`${userSchedule.date}T${userSchedule.startTime}`);
            const userEnd = new Date(`${userSchedule.date}T${userSchedule.endTime}`);
            const newStart = new Date(`${newSchedule.date}T${newSchedule.startTime}`);
            const newEnd = new Date(`${newSchedule.date}T${newSchedule.endTime}`);

            if (newStart < userEnd && newEnd > userStart) {
              console.error('Conflict detected');
              return false; // Conflict detected
            }
          }
        }
      }
    }

    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, attendees: [...e.attendees, userId] }
                : e
    ));
    return true;
  };

  const unregisterFromEvent = (eventId: string, userId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, attendees: e.attendees.filter(id => id !== userId) }
        : e
    ));
  };

  const joinWaitlist = (eventId: string, userId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId && !e.waitlist?.includes(userId)
        ? { ...e, waitlist: [...(e.waitlist || []), userId] }
        : e
    ));
  };

  const leaveWaitlist = (eventId: string, userId: string) => {
    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, waitlist: e.waitlist?.filter(id => id !== userId) }
        : e
    ));
  };

  const isUserInWaitlist = (eventId: string, userId: string): boolean => {
    const event = events.find(e => e.id === eventId);
    return event?.waitlist?.includes(userId) || false;
  };

  const getEventById = (id: string) => events.find(e => e.id === id);

  const getUserEvents = (userId: string) => 
    events.filter(e => e.attendees.includes(userId));

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(e => Array.isArray(e.schedule) && e.schedule.length > 0 && e.schedule.some(s => new Date(`${s.date}T${s.startTime}`) > now))
      .sort((a, b) => {
        const aDate = new Date(`${a.schedule[0].date}T${a.schedule[0].startTime}`);
        const bDate = new Date(`${b.schedule[0].date}T${b.schedule[0].startTime}`);
        return aDate.getTime() - bDate.getTime();
      });
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    joinWaitlist,
    leaveWaitlist,
    isUserInWaitlist,
    getEventById,
    getUserEvents,
    getUpcomingEvents,
    getMainEvents,
    getSubEvents,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};