export function useDebounce<T>(fn: (v: T) => void, delay = 300) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (v: T) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(v), delay);
  };
}