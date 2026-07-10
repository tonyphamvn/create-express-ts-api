import express from 'express';
import { validate } from 'express-validation';
import AuthController from '@/modules/auth/auth.controller';
import wrap from '@/helpers/wrap';
import validateRequest from '@/middlewares/validateRequest';
const router = express.Router();

const authController = new AuthController();

router.post('/auth/login', validate(validateRequest.auth), wrap(authController.login));

export default router;
