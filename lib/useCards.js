"use client";

import { useCallback, useEffect, useState } from "react";

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data.cards || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateCard = useCallback((updated) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const addCards = useCallback((newCards) => {
    setCards((prev) => [...newCards, ...prev]);
  }, []);

  return { cards, loading, refresh, updateCard, addCards };
}
