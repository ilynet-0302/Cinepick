import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  findUserMedia,
  saveUserMedia,
} from "../../repositories/userMediaRepository";
import { mediaKey } from "../../utils/mediaKey";
import { useAuth } from "../auth/useAuth";
import { LibraryContext } from "./LibraryContext";
import {
  libraryFromMediaStates,
  mergeLibraries,
  stateForKey,
} from "./libraryState";
import {
  clearStoredLibrary,
  readLibrary,
  writeLibrary,
} from "./libraryStorage";
import type { LibraryContextValue, LibraryState } from "./libraryTypes";

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<LibraryState>(readLibrary);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setState(readLibrary());
      setCloudLoading(false);
      return;
    }
    let active = true;
    setCloudLoading(true);
    setSyncError(null);
    const guest = readLibrary();
    findUserMedia(userId)
      .then(async (rows) => {
        if (!active) return;
        const merged = mergeLibraries(guest, libraryFromMediaStates(rows));
        setState(merged);
        const keys = new Set([
          ...merged.watchlist,
          ...merged.favorite,
          ...merged.watched,
          ...Object.keys(merged.ratings),
          ...Object.keys(merged.progress),
        ]);
        await Promise.all(
          [...keys].map((key) =>
            saveUserMedia(userId, key, stateForKey(merged, key)),
          ),
        );
        clearStoredLibrary();
      })
      .catch((error: Error) => active && setSyncError(error.message))
      .finally(() => active && setCloudLoading(false));
    return () => {
      active = false;
    };
  }, [userId, authLoading]);

  useEffect(() => {
    if (!userId && !authLoading) writeLibrary(state);
  }, [state, userId, authLoading]);

  const persist = useCallback(
    (key: string, next: LibraryState) => {
      if (!userId) return;
      setSyncError(null);
      void saveUserMedia(userId, key, stateForKey(next, key)).catch(
        (error: Error) => setSyncError(error.message),
      );
    },
    [userId],
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      ...state,
      cloudLoading,
      syncError,
      toggle: (list, movie) => {
        const key = mediaKey(movie);
        setState((current) => {
          const next = {
            ...current,
            [list]: current[list].includes(key)
              ? current[list].filter((item) => item !== key)
              : [...current[list], key],
          };
          persist(key, next);
          return next;
        });
      },
      inList: (list, movie) => state[list].includes(mediaKey(movie)),
      rate: (movie, rating) => {
        const key = mediaKey(movie);
        const safeRating = Math.max(1, Math.min(10, Math.round(rating)));
        setState((current) => {
          const next = {
            ...current,
            ratings: { ...current.ratings, [key]: safeRating },
          };
          persist(key, next);
          return next;
        });
      },
      setProgress: (movie, progress) => {
        const key = mediaKey(movie);
        const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
        setState((current) => {
          const watched =
            safeProgress >= 100 && !current.watched.includes(key)
              ? [...current.watched, key]
              : current.watched;
          const next = {
            ...current,
            watched,
            progress: { ...current.progress, [key]: safeProgress },
          };
          persist(key, next);
          return next;
        });
      },
    }),
    [state, cloudLoading, syncError, persist],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}
