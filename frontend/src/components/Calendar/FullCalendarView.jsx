import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import './calendar.css'
import { useState } from 'react'
import { calendarEvents as initialEvents } from '../../utils/mockData'

export default function FullCalendarView() {
  const [events, setEvents] = useState(initialEvents)

  function handleDateClick(info) {
    // simple demo: add a quick event on date click
    const title = prompt('Add quick event for ' + info.dateStr)
    if (title) {
      const newEvent = { id: String(Date.now()), title, start: info.dateStr }
      setEvents((e) => [newEvent, ...e])
    }
  }

  function handleEventClick({ event }) {
    const action = confirm(`Mark "${event.title}" as done?`)
    if (action) {
      // remove the event locally for demo purposes
      setEvents((e) => e.filter((ev) => ev.id !== event.id))
    }
  }

  return (
    <div className="fc-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
      />
    </div>
  )
}
