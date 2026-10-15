import { useContext } from "react";
import { ShortlistContext } from "./shortlistContext.js";

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (!context) {
    throw new Error("useShortlist must be used inside ShortlistProvider");
  }

  return context;
}
