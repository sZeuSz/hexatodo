import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model('User', userSchema);
