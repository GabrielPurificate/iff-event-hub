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
}

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'attendees' | 'createdAt'>) => void;
  registerForEvent: (eventId: string, userId: string) => boolean;
  unregisterFromEvent: (eventId: string, userId: string) => void;
  getEventById: (id: string) => Event | undefined;
  getUserEvents: (userId: string) => Event[];
  getUpcomingEvents: () => Event[];
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
    organizer: 'Prof. João Silva',
    organizerId: 'prof-joao',
    attendees: ['user1', 'user2'],
    maxAttendees: 100,
    location: 'Auditório Principal',
    category: 'Tecnologia',
    createdAt: new Date('2024-09-01')
  },
  {
    id: '2',
    title: 'Workshop de React e Node.js',
    description: 'Aprenda a desenvolver aplicações modernas com React no frontend e Node.js no backend.',
    date: '2024-10-22',
    time: '14:00',
    organizer: 'Prof. Maria Santos',
    organizerId: 'prof-maria',
    attendees: ['user3'],
    maxAttendees: 30,
    location: 'Laboratório de Informática 1',
    category: 'Programação',
    createdAt: new Date('2024-09-05')
  }
];

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('iff-events');
    return saved ? JSON.parse(saved) : mockEvents;
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
    registerForEvent,
    unregisterFromEvent,
    getEventById,
    getUserEvents,
    getUpcomingEvents,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};