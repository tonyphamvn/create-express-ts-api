import express from 'express';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/users.routes';

const router = express.Router();

router.get('/', function (_req, res, _next) {
  res.redirect('/health-check');
});

/* Health check */
router.get('/health-check', function (_req, res, _next) {
  res.send('APIs OK!');
});

router.use('/auth', authRoutes);
router.use('/user', userRoutes);

export default router;
