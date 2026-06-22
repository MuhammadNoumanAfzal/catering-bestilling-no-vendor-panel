export const selectAuthState = (state) => state.auth;
export const selectAuthUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken);
