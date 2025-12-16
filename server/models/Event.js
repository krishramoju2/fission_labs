import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  location: String,
  capacity: { type: Number, required: true, min: 1 },
  image: String, // Base64 string: "data:image/jpeg;base64,/9j/4AAQ..."
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rsvps: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
