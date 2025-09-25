import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  organizer: string;
  organizerId: string;
  attendees: string[];
  maxAttendees?: number;
  location?: string;
  category?: string;
  createdAt: Date;
  parentId?: string;
}

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'attendees' | 'createdAt'>) => void;
  updateEvent: (eventId: string, eventData: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  registerForEvent: (eventId: string, userId: string) => boolean;
  unregisterFromEvent: (eventId: string, userId: string) => void;
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

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Semana de Tecnologia 2024',
    description: 'Uma semana completa de palestras, workshops e hackathons sobre as mais novas tecnologias.',
    date: '2024-10-15',
    time: '08:00',
    organizer: 'Coordenação de TADS',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 500,
    location: 'IFF Campos Centro',
    category: 'Tecnologia',
    createdAt: new Date('2024-09-01'),
    parentId: undefined,
  },
  {
    id: '2',
    title: 'Workshop de React e Node.js',
    description: 'Aprenda a desenvolver aplicações modernas com React no frontend e Node.js no backend.',
    date: '2024-10-15',
    time: '14:00',
    organizer: 'Prof. Maria Santos',
    organizerId: 'organizer-id',
    attendees: ['user3'],
    maxAttendees: 30,
    location: 'Laboratório de Informática 1',
    category: 'Programação',
    createdAt: new Date('2024-09-05'),
    parentId: '1',
  },
  {
    id: '3',
    title: 'Palestra sobre Inteligência Artificial',
    description: 'Descubra o futuro da IA e suas aplicações no mercado de trabalho.',
    date: '2024-10-16',
    time: '10:00',
    organizer: 'Prof. Carlos Pereira',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 100,
    location: 'Auditório Principal',
    category: 'Inteligência Artificial',
    createdAt: new Date('2024-09-06'),
    parentId: '1',
  },
  {
    id: '4',
    title: 'Minicurso de Docker',
    description: 'Aprenda a containerizar suas aplicações com Docker.',
    date: '2024-10-17',
    time: '09:00',
    organizer: 'Prof. Ana Souza',
    organizerId: 'organizer-id',
    attendees: [],
    maxAttendees: 25,
    location: 'Laboratório de Redes',
    category: 'DevOps',
    createdAt: new Date('2024-09-07'),
    parentId: '1',
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
      }));
    }
    return mockEvents;
  });

  // Save to localStorage whenever events change
  React.useEffect(() => {
    localStorage.setItem('iff-events', JSON.stringify(events));
  }, [events]);

  const addEvent = (eventData: Omit<Event, 'id' | 'attendees' | 'createdAt'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      attendees: [],
      createdAt: new Date(),
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
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    
    if (event.attendees.includes(userId)) return false;
    
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return false; // Event is full
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

  const getEventById = (id: string) => events.find(e => e.id === id);

  const getUserEvents = (userId: string) => 
    events.filter(e => e.attendees.includes(userId));

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(e => new Date(`${e.date}T${e.time}`) > now)
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getEventById,
    getUserEvents,
    getUpcomingEvents,
    getMainEvents,
    getSubEvents,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};