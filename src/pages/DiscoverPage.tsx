import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { genreIds } from "../data/genres";
import { discoverTitles, type DiscoverFilters } from "../api/tmdb";
import { DiscoverFiltersPanel } from "../features/discover/DiscoverFiltersPanel";
import { DiscoverResults } from "../features/discover/DiscoverResults";
import { parseDiscoverSearchParams } from "../features/discover/discoverSearchParams";

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const values = parseDiscoverSearchParams(params);
  const genreParam = values.genre;
  const activeGenre =
    Object.entries(genreIds).find(([, id]) => String(id) === genreParam)?.[0] ||
    "All";
  const filters: DiscoverFilters = {
    genre: genreParam || undefined,
    type: values.type,
    rating: values.rating || undefined,
    year: values.year === "all" ? undefined : values.year,
    language: values.language === "all" ? undefined : values.language,
    sort: values.sort,
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["discover", filters],
    queryFn: ({ pageParam }) => discoverTitles(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      pages.length < last.totalPages ? pages.length + 1 : undefined,
  });
  const titles = data?.pages.flatMap((page) => page.results) || [];
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || value === "All" || value === "0")
      next.delete(key);
    else
      next.set(key, key === "genre" ? String(genreIds[value] || value) : value);
    setParams(next);
  };
  const reset = () => setParams({});

  return (
    <div className="standard-page page-enter">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Find your next story</p>
          <h1>Discover</h1>
          <p>Live films and series from TMDB, tuned to your taste.</p>
        </div>
        <div className="results-count">
          <strong>{titles.length}</strong>
          <span>loaded titles</span>
        </div>
      </div>
      <div className="discover-layout">
        <DiscoverFiltersPanel
          type={values.type}
          year={values.year}
          language={values.language}
          minRating={values.rating}
          sort={values.sort}
          onChange={setFilter}
          onReset={reset}
        />
        <DiscoverResults
          titles={titles}
          activeGenre={activeGenre}
          hasActiveFilters={Boolean(params.toString())}
          isLoading={isLoading}
          isError={isError}
          hasNextPage={Boolean(hasNextPage)}
          isFetchingNextPage={isFetchingNextPage}
          onGenreChange={(genre) => setFilter("genre", genre)}
          onReset={reset}
          onRetry={() => refetch()}
          onLoadMore={() => fetchNextPage()}
        />
      </div>
    </div>
  );
}
