import { Magic } from 'magic-sdk';

const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY);

export const checkUser = async (cb) => {
  const isLoggedIn = await magic.user.isLoggedIn();
  if (isLoggedIn) {
    const user = await magic.user.getMetadata();
    return cb({ isLoggedIn: true, email: user.email });
  }
  return cb({ isLoggedIn: false });
};

export const loginUser = async (email, cb) => {
  await magic.auth.loginWithMagicLink({ email });
  return cb({ isLoggedIn: true });
};

export const logoutUser = async () => {
  await magic.user.logout();
  window.location.assign('/');
};