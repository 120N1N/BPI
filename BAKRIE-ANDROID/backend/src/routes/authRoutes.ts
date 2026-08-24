import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { authenticate } from '../models/middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes test
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

export default router;
