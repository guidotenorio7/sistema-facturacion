import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  hashedPassword: String,
  fullName: String,
  roles: [String],
  email: String,
});

export default mongoose.model('User', userSchema);
