import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the authenticated user has one of the required roles.
 * @param allowedRoles Array of role strings (e.g. ['admin_dept', 'staff'])
 */
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Usually users can have multiple roles, but for simplicity we assume req.user.roles is an array
    // Or req.user.role if they only have one active role in the token
    const userRole = req.user.role;
    
    // If the token carries an array of roles:
    if (Array.isArray(userRole)) {
      const hasRole = userRole.some(r => allowedRoles.includes(r));
      if (!hasRole) {
        return res.status(403).json({ message: 'Forbidden. You do not have the required permissions.' });
      }
    } else {
      // Single role string
      if (!allowedRoles.includes(userRole as string)) {
        return res.status(403).json({ message: 'Forbidden. You do not have the required permissions.' });
      }
    }

    next();
  };
};
