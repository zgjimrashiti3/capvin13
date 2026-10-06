import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../api/settings';

export const SETTINGS_QUERY_KEY = ['settings'];

// Whether the customer menu shows product photos (admin toggle on the dashboard).
// Defaults to showing them while loading or if the settings can't be fetched,
// so nothing changes for customers when the setting is missing.
export function useShowImagesSetting() {
  const { data, isPending, isError } = useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: getSettings });
  return { showImages: data?.showImages ?? true, isLoading: isPending && !isError };
}

export function useShowImages() {
  return useShowImagesSetting().showImages;
}
