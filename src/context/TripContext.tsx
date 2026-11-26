import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ItineraryItem } from '../types';

interface TripContextValue {
  tripCode: string;
  items: ItineraryItem[];
  isLoading: boolean;
  isDrawerOpen: boolean;
  toastMessage: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  switchTripCode: (code: string) => Promise<void>;
  addStop: (payload: {
    item_type: 'destination' | 'experience';
    item_slug: string;
    day_number?: number;
    preferred_month?: string;
    notes?: string;
  }) => Promise<void>;
  updateStop: (
    id: number,
    payload: { day_number?: number; preferred_month?: string; notes?: string }
  ) => Promise<void>;
  removeStop: (id: number) => Promise<void>;
  clearToast: () => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [tripCode, setTripCode] = useState<string>(() => {
    try {
      return localStorage.getItem('uzbekistan_trip_code') || 'SILK-2026';
    } catch {
      return 'SILK-2026';
    }
  });
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  const loadItinerary = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const res = await api.getItinerary(code);
      setTripCode(res.trip_code);
      setItems(res.items);
      try {
        localStorage.setItem('uzbekistan_trip_code', res.trip_code);
      } catch {
        // Ignore storage restriction
      }
    } catch (err) {
      console.error('Failed to load itinerary:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItinerary(tripCode);
  }, [loadItinerary, tripCode]);

  const switchTripCode = useCallback(
    async (code: string) => {
      const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24);
      if (cleaned.length < 3) {
        showToast('Trip code must be at least 3 characters.');
        return;
      }
      await loadItinerary(cleaned);
      showToast(`Loaded itinerary ${cleaned}`);
    },
    [loadItinerary, showToast]
  );

  const addStop = useCallback(
    async (payload: {
      item_type: 'destination' | 'experience';
      item_slug: string;
      day_number?: number;
      preferred_month?: string;
      notes?: string;
    }) => {
      const nextDay =
        payload.day_number ??
        (items.length > 0 ? Math.max(...items.map((i) => i.day_number)) + 1 : 1);
      const res = await api.addItineraryItem({
        trip_code: tripCode,
        item_type: payload.item_type,
        item_slug: payload.item_slug,
        day_number: nextDay,
        preferred_month: payload.preferred_month || 'April',
        notes: payload.notes || '',
      });
      setItems((prev) =>
        [...prev, res.item].sort((a, b) => a.day_number - b.day_number || a.id - b.id)
      );
      showToast(`Added "${res.item.title}" to Day ${res.item.day_number}`);
    },
    [items, showToast, tripCode]
  );

  const updateStop = useCallback(
    async (
      id: number,
      payload: { day_number?: number; preferred_month?: string; notes?: string }
    ) => {
      const res = await api.updateItineraryItem(id, payload);
      setItems((prev) =>
        prev
          .map((item) => (item.id === id ? res.item : item))
          .sort((a, b) => a.day_number - b.day_number || a.id - b.id)
      );
    },
    []
  );

  const removeStop = useCallback(async (id: number) => {
    await api.deleteItineraryItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Stop removed from itinerary');
  }, [showToast]);

  return (
    <TripContext.Provider
      value={{
        tripCode,
        items,
        isLoading,
        isDrawerOpen,
        toastMessage,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        switchTripCode,
        addStop,
        updateStop,
        removeStop,
        clearToast: () => setToastMessage(null),
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTrip must be used within TripProvider');
  }
  return ctx;
}
