import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function parseICS(icsData) {
  const events = [];
  const unfoldedData = icsData.replace(/\r\n /g, '').replace(/\n /g, '');
  const lines = unfoldedData.split(/\r\n|\n|\r/);
  let currentEvent = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
    } else if (currentEvent) {
      if (line.startsWith('UID:')) currentEvent.id = line.substring(4);
      else if (line.startsWith('SUMMARY:')) currentEvent.title = line.substring(8);
      else if (line.startsWith('LOCATION:')) currentEvent.location = line.substring(9);
      else if (line.startsWith('DESCRIPTION:')) currentEvent.description = line.substring(12).replace(/\\n/g, '\n');
      else if (line.startsWith('DTSTART')) {
        const parts = line.split(':');
        if (parts.length > 1) {
          const d = parts[1];
          if (d.length >= 15) {
            currentEvent.start = `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}T${d.substring(9,11)}:${d.substring(11,13)}:${d.substring(13,15)}Z`;
          }
        }
      }
      else if (line.startsWith('DTEND')) {
        const parts = line.split(':');
        if (parts.length > 1) {
          const d = parts[1];
          if (d.length >= 15) {
            currentEvent.end = `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}T${d.substring(9,11)}:${d.substring(11,13)}:${d.substring(13,15)}Z`;
          }
        }
      }
    }
  }
  return events;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const calendarUrl = searchParams.get('url');

  try {
    let fileContent = '';
    if (calendarUrl) {
      const resp = await fetch(calendarUrl);
      if (!resp.ok) throw new Error('Failed to fetch from FlopEDT');
      fileContent = await resp.text();
    } else {
      const mockFilePath = path.join(process.cwd(), 'data', 'mock.ics');
      fileContent = fs.readFileSync(mockFilePath, 'utf-8');
    }

    const schedule = parseICS(fileContent)
      .filter((e) => e.start && e.title)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error fetching/parsing schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule data' }, { status: 500 });
  }
}
