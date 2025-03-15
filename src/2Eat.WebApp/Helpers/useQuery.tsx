import { use } from "react";

const promiseCache = new Map<string, unknown>();

const useQuery = <T,>(fn: () => Promise<T>, key: string): T | undefined => {
  if (!promiseCache.has(key)) {
    promiseCache.set(key, fn());
  }

  const promise = promiseCache.get(key) as Promise<T>;

  const result = use(promise);
  return result;
};

export default useQuery;
