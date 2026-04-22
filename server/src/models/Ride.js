import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver_name: { type: String, required: true },
  destination: { type: String, required: true, trim: true },
  pickup_location: { type: String, required: true, trim: true },
  departure_time: { type: Date, required: true },
  total_seats: { type: Number, required: true, min: 1 },
  available_seats: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['open', 'full', 'completed', 'cancelled'], default: 'open' },
}, { timestamps: true });

rideSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.driver_id = ret.driver_id?.toString?.() || ret.driver_id;
    ret.created_at = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  }
});

export const Ride = mongoose.model('Ride', rideSchema);
