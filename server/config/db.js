import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log('MongoDB is not configured; account features are unavailable.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');
  } catch (error) {
    console.error('MongoDB unavailable:', error.message);
  }
}

export const isDbReady = () => mongoose.connection.readyState === 1;

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
