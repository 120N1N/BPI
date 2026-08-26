import rateLimit from 'express-rate-limit';

// General API limit - 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    status: 'error',
    message: 'Terlalu banyak request dari IP ini, silakan coba lagi setelah 15 menit.'
  }
});

// Stricter limit for Auth/Login - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit.'
  }
});

// Stricter limit for Ticket Creation - 20 requests per hour (Prevents Spam Tickets)
export const ticketCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20,
  message: {
    status: 'error',
    message: 'Batas pembuatan tiket tercapai. Anda hanya bisa membuat 20 tiket per jam.'
  }
});
