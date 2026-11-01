import { useEffect, useState } from "react";
import { list } from "../api.js";

export function useList(resource) {
  const [state, setState] = useState({ data: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    list(resource)
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ data: [], loading: false, error: e.message }));
    return () => {
      cancelled = true;
    };
  }, [resource]);

  return state;
}
