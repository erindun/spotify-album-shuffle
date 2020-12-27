import React, { createContext, Dispatch, useReducer } from 'react';
import { AccessToken } from 'common';

type InitialStateType = { accessToken: AccessToken | null };
type Action =
  | {
      type: 'REFRESH';
      payload: AccessToken | null;
    }
  | { type: 'DELETE' }
  | { type: 'BREAK' };

const initialState: InitialStateType = { accessToken: null };

export const AccessTokenContext = createContext<{
  state: InitialStateType;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const AccessTokenProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    (state: InitialStateType, action: Action) => {
      switch (action.type) {
        case 'REFRESH':
          return {
            ...state,
            accessToken: action.payload,
          };
        case 'DELETE':
          return initialState;
        case 'BREAK':
          return {
            ...state,
            accessToken: { value: 'aaa', expiresAt: '0' },
          };
        default:
          return state;
      }
    },
    initialState
  );

  return (
    <AccessTokenContext.Provider value={{ state, dispatch }}>
      {children}
    </AccessTokenContext.Provider>
  );
};
