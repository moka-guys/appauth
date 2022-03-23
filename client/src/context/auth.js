import React, { useReducer, createContext } from 'react';
import jwtDecode from 'jwt-decode';
import Cookies from 'universal-cookie';

const COOKIE = 'appauth';
const cookies = new Cookies();

const initialState = {
  user: null
};

if (localStorage.getItem(COOKIE)) {
  const decodedToken = jwtDecode(localStorage.getItem(COOKIE));
  if (decodedToken.exp * 1000 < Date.now()) {
    localStorage.removeItem(COOKIE);
    cookies.remove(COOKIE);
  } else {
    initialState.user = decodedToken;
  }
}

const AuthContext = createContext({
  user: null,
  login: (userData) => {},
  logout: () => {}
});

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null
      };
    default:
      return state;
  }
}

function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  function login(userData) {
    localStorage.setItem(COOKIE, userData.token);
    cookies.set(COOKIE, userData.token, { path: '/' });
    console.log(`Set Cookie ${cookies.get(COOKIE)}`);
    dispatch({ type: 'LOGIN', payload: userData });
  }

  function logout() {
    // remove from local storage
    localStorage.removeItem(COOKIE);
    // remove cookie
    cookies.remove(COOKIE, { path: '/' });
    // dispatch
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider
      value={{ user: state.user, login, logout }}
      {...props}
    />
  );
}

export { AuthContext, AuthProvider };
