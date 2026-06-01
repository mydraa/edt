import React, { useState } from 'react';
import styles from './Calendar.module.css';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Calendar({ schedule }) {
  const [weekOffset, setWeekOffset] = useState(0);

  if (!schedule || schedule.length === 0) {
    return (
      <div className={`${styles.emptyState} glass`}>
        <p>Aucun cours prévu ou l'emploi du temps est vide.</p>
      </div>
    );
  }

  const now = new Date();
  const viewDate = addWeeks(now, weekOffset);
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(viewDate, { weekStartsOn: 1 });

  // Filter events to the currently viewed week
  const currentWeekEvents = schedule.filter(event => {
    const dateObj = typeof event.start === 'string' ? parseISO(event.start) : new Date(event.start);
    return isWithinInterval(dateObj, { start: weekStart, end: weekEnd });
  });

  // Group events by day
  const groupedEvents = currentWeekEvents.reduce((acc, event) => {
    const dateObj = typeof event.start === 'string' ? parseISO(event.start) : new Date(event.start);
    const dateKey = format(dateObj, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.controls}>
        <button className={styles.navButton} onClick={() => setWeekOffset(o => o - 1)}>Semaine précédente</button>
        <div className={styles.weekLabel}>
          Semaine du {format(weekStart, 'd MMM', { locale: fr })} au {format(weekEnd, 'd MMM yyyy', { locale: fr })}
        </div>
        <button className={styles.navButton} onClick={() => setWeekOffset(o => o + 1)}>Semaine suivante</button>
      </div>
      
      {sortedDates.length === 0 ? (
        <div className={`${styles.emptyState} glass`}>
          <p>Aucun cours cette semaine.</p>
        </div>
      ) : (
        sortedDates.map((date) => {
          const events = groupedEvents[date];
          const dateObj = parseISO(date);
          
          return (
            <div key={date} className={styles.dayContainer}>
              <h2 className={styles.dayHeader}>
                {format(dateObj, 'EEEE d MMMM yyyy', { locale: fr })}
              </h2>
              <div className={styles.eventsGrid}>
                {events.map((event) => {
                  const startTime = typeof event.start === 'string' ? parseISO(event.start) : new Date(event.start);
                  const endTime = typeof event.end === 'string' ? parseISO(event.end) : new Date(event.end);
                  
                  return (
                    <div key={event.id} className={`${styles.eventCard} glass`}>
                      <div className={styles.eventTime}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                      </div>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      {event.location && (
                        <div className={styles.eventLocation}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {event.location}
                        </div>
                      )}
                      {event.description && (
                        <div className={styles.eventDescription}>
                          {event.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
