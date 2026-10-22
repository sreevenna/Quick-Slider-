import { useState, useEffect } from "react";

export default function useLocalStorage(key, initial) {
  // read saved value once, when the component first loads
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });

  // save every time the value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}