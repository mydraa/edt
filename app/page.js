'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Calendar from './components/Calendar';

export default function Home() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch('/api/schedule?url=https://flopedt.iut-blagnac.fr/fr/ics/RT/structural_group/534.ics');
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        const data = await response.json();
        setSchedule(data.schedule);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  return (
    <>
      <div className={styles.background} />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>FlopEDT Schedule</h1>
          <p className={styles.subtitle}>
            Your premium timetable interface for IUT Blagnac.
            Currently fetching live schedule data for Group 1A.
          </p>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Chargement de l'emploi du temps...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <Calendar schedule={schedule} />
          )}
        </div>
      </main>
    </>
  );
}
