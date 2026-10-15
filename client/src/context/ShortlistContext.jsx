import { useState } from "react";
import { ShortlistContext } from "./shortlistContext.js";

const STORAGE_KEY = "creatorcircle_shortlist";

const readShortlist = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export function ShortlistProvider({ children }) {
  const [creatorIds, setCreatorIds] = useState(readShortlist);

  const toggleCreator = (creatorId) => {
    setCreatorIds((currentIds) => {
      const nextIds = currentIds.includes(creatorId)
        ? currentIds.filter((id) => id !== creatorId)
        : [...currentIds, creatorId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
      return nextIds;
    });
  };

  const removeCreator = (creatorId) => {
    setCreatorIds((currentIds) => {
      const nextIds = currentIds.filter((id) => id !== creatorId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
      return nextIds;
    });
  };

  return (
    <ShortlistContext.Provider
      value={{ creatorIds, toggleCreator, removeCreator }}
    >
      {children}
    </ShortlistContext.Provider>
  );
}
