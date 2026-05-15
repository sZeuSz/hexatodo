import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET ?? 'dev_secret_32_characters_minimum!!';

const token = jwt.sign(
  { sub: '507f1f77bcf86cd799439011', email: 'test@test.com' },
  secret,
  { expiresIn: '1d' },
);

// eslint-disable-next-line no-console
console.log(token);
