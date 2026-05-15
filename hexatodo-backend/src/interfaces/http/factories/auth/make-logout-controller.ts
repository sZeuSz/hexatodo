import { LogoutController } from '../../controllers/auth/logout.controller.js';

export function makeLogoutController(): LogoutController {
  return new LogoutController();
}
