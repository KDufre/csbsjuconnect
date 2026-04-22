import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  ride_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rider_name: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
}, { timestamps: true });

bookingSchema.index({ ride_id: 1, rider_id: 1 }, { unique: true });

bookingSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.ride_id = ret.ride_id?.toString?.() || ret.ride_id;
    ret.rider_id = ret.rider_id?.toString?.() || ret.rider_id;
    ret.created_at = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
  }
});

export const Booking = mongoose.model('Booking', bookingSchema);
