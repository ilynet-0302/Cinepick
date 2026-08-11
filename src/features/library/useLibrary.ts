import { useContext } from "react";
import { LibraryContext } from "./LibraryContext";

export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error("useLibrary must be used inside LibraryProvider");
  return value;
}
