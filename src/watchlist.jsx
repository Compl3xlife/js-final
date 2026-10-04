import { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext(null);
const STORAGE_KEY = "blinker-watchlist";

function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WatchlistProvider({ children }) {
  const [items, setItems] = useState(readSaved);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function has(id) {
    return items.some((item) => item.id === id);
  }

  function toggle(movie) {
    setItems((current) => {
      if (current.some((item) => item.id === movie.id)) return current.filter((item) => item.id !== movie.id);
      return [{
        id: movie.id,
        title: movie.title,
        yearLabel: movie.yearLabel,
        photo: movie.photo,
        rating: movie.rating,
      }, ...current];
    });
  }

  function remove(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <WatchlistContext.Provider value={{ items, has, toggle, remove }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const value = useContext(WatchlistContext);
  if (!value) throw new Error("Watchlist is unavailable");
  return value;
}
