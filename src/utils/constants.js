export const GUEST_ID_KEY = 'greenshoes_guest_id';
export const TOKEN_KEY = 'greenshoes_token';
export const USER_KEY = 'greenshoes_user';

export const SHIPPING_FEE = 11.95;
export const TAX_RATE = 0.06;

export const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'heels', label: 'Heels' },
  { value: 'boots', label: 'Boots' },
  { value: 'flats', label: 'Flats' },
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'sandals', label: 'Sandals' },
];

export const SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'];

// Generate or retrieve guest ID (UUID format)
// Uses sessionStorage so guest data doesn't persist across browser sessions
export const getGuestId = () => {
  let guestId = sessionStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    // Generate a proper UUID v4
    guestId = crypto.randomUUID();
    sessionStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

// Regenerate guest ID (used on logout to start fresh session)
export const regenerateGuestId = () => {
  const newGuestId = crypto.randomUUID();
  sessionStorage.setItem(GUEST_ID_KEY, newGuestId);
  return newGuestId;
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get user data
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Save auth data
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Clear auth data
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Validate card number (Luhn algorithm)
export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Format card number
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Format expiry date
export const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 6);
  }
  return cleaned;
};