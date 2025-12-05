import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'
import { calendarEvents as initialEvents } from '../../utils/mockData'
import { useSettings } from '../../hooks/useSettings'
import Modal from '../Modal'

/**
 * Full-featured calendar component using FullCalendar library.
 * Supports month, week, and day views with event creation and completion.
 * Respects user's week start preference from settings.
 */
export default function FullCalendarView() {
  const [events, setEvents] = useState(initialEvents)
  const { settings } = useSettings()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [newEventTitle, setNewEventTitle] = useState('')

  function handleDateClick(info) {
    setSelectedDate(info.dateStr)
    setModalType('add')
    setModalOpen(true)
  }

  function handleEventClick({ event }) {
    setSelectedEvent(event)
    setModalType('confirm')
    setModalOpen(true)
  }

  function handleAddEvent(e) {
    e.preventDefault()
    if (newEventTitle.trim()) {
      const newEvent = { id: String(Date.now()), title: newEventTitle.trim(), start: selectedDate }
      setEvents((evts) => [newEvent, ...evts])
    }
    closeModal()
  }

  function handleConfirmDelete() {
    setEvents((evts) => evts.filter((ev) => ev.id !== selectedEvent.id))
    closeModal()
  }

  function closeModal() {
    setModalOpen(false)
    setModalType(null)
    setSelectedDate(null)
    setSelectedEvent(null)
    setNewEventTitle('')
  }

  return (
    <div
      className="p-4 rounded-lg border border-white/5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: 'var(--soft-shadow)',
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        firstDay={settings.weekStart === 'monday' ? 1 : 0}
      />

      <Modal
        isOpen={modalOpen && modalType === 'add'}
        onClose={closeModal}
        title={`Add event for ${selectedDate}`}
      >
        <form className="flex flex-col gap-4" onSubmit={handleAddEvent}>
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            Event title
            <input
              type="text"
              className="px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-text text-base focus:outline-none focus:border-accent-2"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Enter event title"
              autoFocus
            />
          </label>
          <div className="flex gap-2 justify-end mt-2">
            <button type="button" className="bg-transparent border-white/10 text-muted hover:bg-white/5 hover:text-text" onClick={closeModal}>Cancel</button>
            <button type="submit">Add Event</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalOpen && modalType === 'confirm'}
        onClose={closeModal}
        title="Complete event"
      >
        <p className="m-0 mb-4 text-muted">
          Mark "{selectedEvent?.title}" as done? This will remove it from the calendar.
        </p>
        <div className="flex gap-2 justify-end">
          <button type="button" className="bg-transparent border-white/10 text-muted hover:bg-white/5 hover:text-text" onClick={closeModal}>Cancel</button>
          <button onClick={handleConfirmDelete}>Mark Done</button>
        </div>
      </Modal>
    </div>
  )
}
