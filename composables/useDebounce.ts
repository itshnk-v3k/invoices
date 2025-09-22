export function useDebounce<T>(fn: (v: T) => void, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (v: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(v);
    }, delay);
  };
  debounced.cancel = () => { if (timer) clearTimeout(timer); timer = null; };
  return debounced as typeof debounced & { cancel: () => void };
}