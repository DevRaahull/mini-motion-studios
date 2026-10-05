import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, Sliders } from 'lucide-react';
import { CalendarEvent, StudioSettings } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface CalendarViewProps {
  events: CalendarEvent[];
  settings: StudioSettings;
  onUpdateSettings: (s: StudioSettings) => void;
  onAddEvent: (evt: CalendarEvent) => void;
  onToggleEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  settings,
  onUpdateSettings,
  onAddEvent,
  onToggleEvent,
}) => {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEventType, setNewEventType] = useState<'Script' | 'Production' | 'Edit' | 'Thumbnail' | 'Release'>('Release');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    onAddEvent({
      id: `evt-${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: settings.default_upload_time || '18:00',
      type: newEventType,
      channelId: settings.youtube_channel_id,
      completed: false
    });
    setNewEventTitle('');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto select-none text-left font-sans">
      
      {/* Header */}
      <div className="bg-[#0e111a] border border-[#202738] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
            PRODUCTION TIMELINE & BATCH SCHEDULING
          </span>
          <h2 className="text-2xl font-black text-white font-display tracking-tight mt-1">
            Studio Production Calendar
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Default upload time: {settings.default_upload_time} • Week starts: {settings.calendar_week_start.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBatchModal(!showBatchModal)}
            className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1a2030] text-zinc-200 border border-[#202738] text-xs font-mono transition flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-red-500" />
            <span>Batch Rules</span>
          </button>
        </div>
      </div>

      {/* Batch Schedule Rules Panel */}
      {showBatchModal && (
        <div className="bg-[#121624] border border-[#20293d] rounded-2xl p-5 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white uppercase font-display">Batch Schedule Automation Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-zinc-400 mb-1">Shorts Upload Frequency</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.batch_short_per_day}
                  onChange={(e) => onUpdateSettings({ ...settings, batch_short_per_day: Number(e.target.value) })}
                  className="w-20 bg-[#0b0e15] border border-[#1e2536] rounded-lg px-3 py-1.5 text-white"
                />
                <span className="text-zinc-400">Short(s) / day</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-zinc-400 mb-1">Long-Form Upload Cadence</label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">1 Long Video every</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.batch_long_every_n_days}
                  onChange={(e) => onUpdateSettings({ ...settings, batch_long_every_n_days: Number(e.target.value) })}
                  className="w-20 bg-[#0b0e15] border border-[#1e2536] rounded-lg px-3 py-1.5 text-white"
                />
                <span className="text-zinc-400">days</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-zinc-400 mb-1">Default Upload Time</label>
              <input
                type="time"
                value={settings.default_upload_time}
                onChange={(e) => onUpdateSettings({ ...settings, default_upload_time: e.target.value })}
                className="bg-[#0b0e15] border border-[#1e2536] rounded-lg px-3 py-1.5 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Event Form */}
      <form onSubmit={handleCreateEvent} className="bg-[#0f121a] border border-[#1e2330] p-4 rounded-xl flex flex-wrap items-center gap-3 font-mono text-xs">
        <input
          type="text"
          required
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          placeholder="New event title (e.g. Premiere Episode 01)"
          className="flex-1 min-w-[200px] bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none"
        />

        <input
          type="date"
          required
          value={newEventDate}
          onChange={(e) => setNewEventDate(e.target.value)}
          className="bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none"
        />

        <select
          value={newEventType}
          onChange={(e) => setNewEventType(e.target.value as any)}
          className="bg-[#121624] border border-[#20293d] rounded-xl px-3 py-2 text-white outline-none"
        >
          <option value="Script">Script</option>
          <option value="Production">Production</option>
          <option value="Edit">Edit</option>
          <option value="Thumbnail">Thumbnail</option>
          <option value="Release">Release</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center gap-1 shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to Schedule</span>
        </button>
      </form>

      {/* Events List or Empty State */}
      {events.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No Scheduled Production Events"
          description="Your release schedule is clean. Add your planned script reviews, voiceover sessions, edits, or upload dates above."
          actionLabel="Add Schedule Event"
          onAction={() => setNewEventTitle('Next Video Premiere')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(evt => (
            <div
              key={evt.id}
              onClick={() => onToggleEvent(evt.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                evt.completed ? 'bg-[#0b0e14] border-emerald-500/30 opacity-75' : 'bg-[#0f121a] border-[#1e2436] hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${evt.completed ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <div>
                  <p className={`text-sm font-semibold ${evt.completed ? 'line-through text-zinc-400' : 'text-white'}`}>
                    {evt.title}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {evt.date} • {evt.time}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border bg-[#151926] text-zinc-300 border-[#232b3d]">
                {evt.type}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
