export const ErrorEnums = {
  ALREADY_EXISTS: 'auth/email-already-in-use',
  INVALID_EMAIL: 'auth/invalid-email',
  PASSWORD_NOT_MATCH: 'auth/password-not-match',
  TOO_MANY_ATTEMPTS: 'auth/too-many-requests',
  NOT_FOUND: 'auth/user-not-found',
  WEAK_PASSWORD: 'auth/weak-password',
  WRONG_PASSWORD: 'auth/wrong-password'
};

Object.freeze(ErrorEnums);
