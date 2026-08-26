import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ 
      where: { email, is_active: true },
      include: [
        { model: UserRole, as: 'roles' },
        { model: require('../models').Department, as: 'department' }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or account inactive.' });
    }

    // 2. Compare password
    const passwordHash = user.get('password_hash') as string;
    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Extract roles
    const userAny = user as any;
    const roles = (userAny.roles && userAny.roles.length > 0) ? userAny.roles.map((r: any) => r.role) : ['user'];
    const departmentName = userAny.department ? userAny.department.name : 'UNKNOWN';

    // 4. Generate JWT Token
    const secret: jwt.Secret = process.env.JWT_SECRET || 'fallback_secret';
    const payload = {
      id: user.get('id'),
      email: user.get('email'),
      name: user.get('name'),
      company_id: user.get('company_id'),
      department_id: user.get('department_id'),
      department_name: departmentName,
      role: roles // Can be array or primary role string
    };

    const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } as jwt.SignOptions);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: payload
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, company_id, department_id } = req.body;

    // Basic validation
    if (!name || !email || !password || !company_id) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await User.create({
      name,
      email,
      password_hash,
      company_id,
      department_id,
      is_active: true
    } as any);

    // Assign default role
    await UserRole.create({
      user_id: newUser.id,
      role: 'user',
      department_id
    } as any);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};
