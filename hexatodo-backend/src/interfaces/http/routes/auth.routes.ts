import { Router } from 'express';
import { adaptRoute } from '../adapters/express.adapter.js';
import { makeLoginController } from '../factories/auth/make-login-controller.js';
import { makeLogoutController } from '../factories/auth/make-logout-controller.js';
import { makeRegisterController } from '../factories/auth/make-register-controller.js';

const register = adaptRoute(makeRegisterController());
const login = adaptRoute(makeLoginController());
const logout = adaptRoute(makeLogoutController());

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
