import { useState, useEffect, useCallback } from "react";

const LS_KEY = "floatingButtonsVisible";

export function useFloatingButtons() {
  const [visible, setVisible] = useState(() => {
    try {
      const v = localStorage.getItem(LS_KEY);
      return v === null ? true : v === "true";
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, visible ? "true" : "false");
    } catch (e) {
      // ignore storage errors
    }
  }, [visible]);

  const hide = useCallback(() => setVisible(false), []);
  const show = useCallback(() => setVisible(true), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  // Expose a quick window toggle for manual testing in dev
  useEffect(() => {
    try {
      window.__toggleFloatingButtons = toggle;
    } catch (e) {}
    return () => {
      try {
        delete window.__toggleFloatingButtons;
      } catch (e) {}
    };
  }, [toggle]);

  return { visible, setVisible, hide, show, toggle };
}

export default useFloatingButtons;
