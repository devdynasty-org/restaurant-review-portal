// Unit tests for the JWT helper.
// NODE_ENV is 'test' under Jest, so jwt.js falls back to its dev secret
// and no JWT_SECRET env var is required to run these.
const { generateToken, verifyToken } = require('../utils/jwt');

describe('jwt helpers', () => {
  test('a generated token verifies back to the original payload', () => {
    const token = generateToken({ id: 42, role: 'owner' });
    const decoded = verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('owner');
  });

  test('verifyToken returns null for a tampered or malformed token', () => {
    expect(verifyToken('not-a-real-token')).toBeNull();
  });
});