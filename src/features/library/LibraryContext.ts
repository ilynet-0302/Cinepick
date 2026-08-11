import { createContext } from "react";
import type { LibraryContextValue } from "./libraryTypes";

export const LibraryContext = createContext<LibraryContextValue | null>(null);
