const bcrypt = require('bcryptjs');
const User = require('../models/User');

describe('User model - comparePassword', () => {
  it('returns true for the correct password', async () => {
    const hashed = await bcrypt.hash('Secret123', 10);
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashed,
    });
    await expect(user.comparePassword('Secret123')).resolves.toBe(true);
  });

  it('returns false for an incorrect password', async () => {
    const hashed = await bcrypt.hash('Secret123', 10);
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashed,
    });
    await expect(user.comparePassword('WrongPassword')).resolves.toBe(false);
  });

  it('rejects a role outside the allowed enum', () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'irrelevant',
      role: 'not_a_real_role',
    });
    const err = user.validateSync();
    expect(err.errors.role).toBeDefined();
  });
});
