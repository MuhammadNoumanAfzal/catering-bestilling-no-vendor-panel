import { useDispatch, useSelector } from "react-redux";
import {
  clearAuthError,
  clearRegisterError,
  clearRegisterState,
  loginUser,
  logoutUser,
  registerVendor,
} from "../store/authSlice";
import {
  selectAccessToken,
  selectAuthState,
  selectAuthUser,
  selectIsAuthenticated,
} from "../store/authSelectors";

export function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector(selectAuthState);
  const user = useSelector(selectAuthUser);
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return {
    accessToken,
    clearAuthError: () => dispatch(clearAuthError()),
    clearRegisterError: () => dispatch(clearRegisterError()),
    clearRegisterState: () => dispatch(clearRegisterState()),
    error: authState.error,
    isAuthenticated,
    isLoggingIn: authState.loginStatus === "loading",
    isLoggingOut: authState.loginStatus === "logging-out",
    isRegistering: authState.registerStatus === "loading",
    login: (credentials) => dispatch(loginUser(credentials)).unwrap(),
    logout: () => dispatch(logoutUser()).unwrap(),
    register: (payload) => dispatch(registerVendor(payload)).unwrap(),
    registerError: authState.registerError,
    registerStatus: authState.registerStatus,
    user,
  };
}
