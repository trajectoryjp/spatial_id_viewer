import { useState } from 'react';
import { useLatest } from 'react-use';

/** state の代わりに stateRef を返す useState */
export const useStateRef = <T>(initialState?: T) => {
  const [state, setState] = useState(initialState);
  const stateRef = useLatest(state);

  return [stateRef, setState] as const;
};
