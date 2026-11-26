import { useState } from 'react';
import { Calendar, Plus, Trash2, X } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { EditorialImage } from './EditorialImage';

const QUICK_CITIES = [
  { slug: 'samarkand', name: 'Samarkand' },
  { slug: 'bukhara', name: 'Bukhara' },
  { slug: 'khiva', name: 'Khiva' },
  { slug: 'tashkent', name: 'Tashkent' },
  { slug: 'shahrisabz', name: 'Shahrisabz' },
];

const MONTHS = ['March', 'April', 'May', 'June', 'September', 'October', 'November'];

interface TripPlannerDrawerProps {
  onNavigate: (path: string) => void;
}

export function TripPlannerDrawer({ onNavigate }: TripPlannerDrawerProps) {
  const {
    tripCode,
    items,
    isLoading,
    isDrawerOpen,
    closeDrawer,
    switchTripCode,
    addStop,
    updateStop,
    removeStop,
  } = useTrip();

  const [codeInput, setCodeInput] = useState(tripCode);
  const [selectedCity, setSelectedCity] = useState('samarkand');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  if (!isDrawerOpen) return null;

  const handleSwitchCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await switchTripCode(codeInput);
  };

  const handleQuickAdd = async () => {
    await addStop({
      item_type: 'destination',
      item_slug: selectedCity,
    });
  };

  const handleSaveNote = async (id: number) => {
    setBusyId(id);
    try {
      await updateStop(id, { notes: noteDraft });
      setEditingNoteId(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Silk Road Trip Planner">
      <div
        className="fixed inset-0 bg-[#0B1B32]/55 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />
      <aside className="relative z-10 w-full max-w-lg bg-[#F9F6F0] text-[#0F1D30] h-full flex flex-col border-l border-[#E2D9C8] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2D9C8] bg-white flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#0E7C86] font-medium">
              Personal Route Builder
            </p>
            <h2 className="font-serif text-2xl font-semibold text-[#0B1B32]">
              Silk Road Itinerary
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close trip planner"
            className="p-2 rounded-lg text-[#4B5563] hover:text-[#0B1B32] hover:bg-[#EFE9DD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trip Code Switcher */}
        <div className="px-6 py-4 bg-[#EFE9DD]/60 border-b border-[#E2D9C8]">
          <form onSubmit={handleSwitchCode} className="flex items-center gap-2">
            <label htmlFor="trip-code-input" className="text-xs font-medium text-[#475569] shrink-0">
              Trip Code
            </label>
            <input
              id="trip-code-input"
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="SILK-2026"
              className="flex-1 min-w-0 px-3 py-1.5 text-xs font-mono uppercase bg-white border border-[#D8CEBC] rounded-md focus:outline-none focus:border-[#0E7C86]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium bg-[#0B1B32] text-white rounded-md hover:bg-[#173052] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Load / Create
            </button>
          </form>
          <p className="text-[11px] text-[#5B6778] mt-1.5">
            Changes save directly to SQLite under <span className="font-medium text-[#0B1B32]">{tripCode}</span>.
          </p>
        </div>

        {/* Quick Add City Bar */}
        <div className="px-6 py-3.5 border-b border-[#E2D9C8] bg-white flex items-center gap-2">
          <select
            aria-label="Choose a city to add"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
          >
            {QUICK_CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Stop
          </button>
        </div>

        {/* Stops List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-[#5B6778]">Loading saved stops...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[#D8CEBC] rounded-xl p-6 bg-white">
              <Calendar className="w-8 h-8 text-[#C59B43] mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-serif text-xl text-[#0B1B32] mb-1">Your itinerary is open</p>
              <p className="text-sm text-[#5B6778] mb-4">
                Add Samarkand, Bukhara, Khiva, Tashkent, or curated Silk Road experiences to build your route.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  onNavigate('/destinations');
                }}
                className="px-4 py-2 text-sm font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors cursor-pointer"
              >
                Browse Destinations
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E2D9C8] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-[#E2D9C8]">
                    <EditorialImage
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#0E7C86] tabular-nums">
                        Day {item.day_number} · {item.city}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStop(item.id)}
                        aria-label={`Remove ${item.title}`}
                        className="p-1 text-[#64748B] hover:text-[#B91C1C] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#0B1B32] leading-snug truncate">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Day & Month controls */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <label className="block text-xs text-[#5B6778]">
                    Day Number
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={item.day_number}
                      onChange={(e) =>
                        updateStop(item.id, { day_number: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="mt-1 w-full px-2.5 py-1.5 text-xs bg-[#F9F6F0] border border-[#D8CEBC] rounded-md tabular-nums focus:outline-none focus:border-[#0E7C86]"
                    />
                  </label>
                  <label className="block text-xs text-[#5B6778]">
                    Target Month
                    <select
                      value={item.preferred_month}
                      onChange={(e) => updateStop(item.id, { preferred_month: e.target.value })}
                      className="mt-1 w-full px-2.5 py-1.5 text-xs bg-[#F9F6F0] border border-[#D8CEBC] rounded-md focus:outline-none focus:border-[#0E7C86]"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Notes editor */}
                {editingNoteId === item.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={2}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add train times, hotel courtyard, or local dining notes..."
                      className="w-full px-3 py-2 text-xs bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="px-3 py-1 text-xs text-[#475569] hover:text-[#0B1B32] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleSaveNote(item.id)}
                        className="px-3 py-1 text-xs font-medium bg-[#0E7C86] text-white rounded-md hover:bg-[#095C64] cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-[#EFE9DD]">
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {item.notes || 'No travel notes added yet.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(item.id);
                        setNoteDraft(item.notes || '');
                      }}
                      className="text-xs font-medium text-[#0E7C86] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Edit note
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
