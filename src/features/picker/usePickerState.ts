import { useMemo, useState } from "react";
import { useLibrary } from "../library/useLibrary";
import { parseMediaKey } from "../../utils/mediaKey";
import type { PickCriteria } from "./recommendationEngine";
import { moods } from "./pickerOptions";

export interface PickerFormState {
  step: number;
  mood: string;
  time: string;
  company: string;
  minRating: number;
  genre: string;
  minYear: number;
  includeWatched: boolean;
}

const initialForm: PickerFormState = {
  step: 1,
  mood: "",
  time: "",
  company: "",
  minRating: 7,
  genre: "All",
  minYear: 0,
  includeWatched: false,
};

export function usePickerState() {
  const library = useLibrary();
  const [form, setForm] = useState(initialForm);
  const [shuffle, setShuffle] = useState(0);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);

  const criteria = useMemo<PickCriteria>(
    () => ({
      moodGenres: moods.find((item) => item.value === form.mood)?.genres || [],
      companyGenres:
        form.company === "family"
          ? ["Family", "Animation", "Adventure"]
          : form.company === "friends"
            ? ["Comedy", "Adventure", "Thriller"]
            : form.company === "couple"
              ? ["Romance", "Drama", "Comedy"]
              : [],
      time: form.time as PickCriteria["time"],
      minRating: form.minRating,
      preferredGenre: form.genre,
      minYear: form.minYear || undefined,
      includeWatched: form.includeWatched,
      watchedIds: library.watched
        .map(parseMediaKey)
        .filter((item) => item?.type === "movie")
        .map((item) => item!.id),
      excludedIds,
      seed: shuffle,
    }),
    [form, library.watched, excludedIds, shuffle],
  );

  const setField = <K extends keyof PickerFormState>(
    key: K,
    value: PickerFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const nextStep = () =>
    setForm((current) => ({ ...current, step: current.step + 1 }));
  const previousStep = () =>
    setForm((current) => ({ ...current, step: current.step - 1 }));
  const pickAgain = (ids: number[]) => {
    setExcludedIds((current) => [...new Set([...current, ...ids])]);
    setShuffle((current) => current + 1);
  };
  const changeAnswers = () => {
    setExcludedIds([]);
    setShuffle(0);
    setForm(initialForm);
  };

  return {
    form,
    criteria,
    setField,
    nextStep,
    previousStep,
    pickAgain,
    changeAnswers,
  };
}
