import { useQuery } from "@tanstack/react-query";
import { PickerError } from "../components/picker/PickerError";
import { PickerLoading } from "../components/picker/PickerLoading";
import { PickerResults } from "../components/picker/PickerResults";
import { PickerWizard } from "../components/picker/PickerWizard";
import { getMoviePicks } from "../features/picker/moviePickService";
import { usePickerState } from "../features/picker/usePickerState";

export default function PickPage() {
  const picker = usePickerState();

  const {
    data: picks = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["movie-picks", picker.criteria],
    queryFn: () => getMoviePicks(picker.criteria),
    enabled: picker.form.step === 5,
  });

  if (picker.form.step === 5 && isLoading) return <PickerLoading />;
  if (picker.form.step === 5 && isError)
    return (
      <PickerError
        onRetry={() => refetch()}
        onChangeAnswers={picker.changeAnswers}
      />
    );
  if (picker.form.step === 5)
    return (
      <PickerResults
        picks={picks}
        criteria={picker.criteria}
        mood={picker.form.mood}
        time={picker.form.time}
        company={picker.form.company}
        minRating={picker.form.minRating}
        isFetching={isFetching}
        onPickAgain={() => picker.pickAgain(picks.map((movie) => movie.id))}
        onChangeAnswers={picker.changeAnswers}
      />
    );
  return (
    <PickerWizard
      form={picker.form}
      onChange={picker.setField}
      onNext={picker.nextStep}
      onBack={picker.previousStep}
    />
  );
}
