'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Calendar from './components/Calendar';

export default function Home() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch('/api/schedule?url=https://flopedt.iut-blagnac.fr/fr/ics/RT/structural_group/534.ics');
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        const data = await response.json();
        setSchedule(data.schedule);
        if (data.isCached) {
            setCacheInfo(new Date(data.lastUpdate).toLocaleString('fr-FR'));
        }
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
          <a href="/FlopEDT.apk" download className={styles.downloadButton} style={{ marginTop: '1rem', display: 'inline-block', background: '#0070f3', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Télécharger l'App Android
          </a>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Chargement de l'emploi du temps...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              {cacheInfo && (
                <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem' }}>
                  ⚠️ Serveur FlopEDT injoignable. Affichage de la dernière version en cache (mise à jour : {cacheInfo}).
                </div>
              )}
              <Calendar schedule={schedule} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
