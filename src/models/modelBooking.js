import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestuserId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    viewTime: { type: String, required: true },
    viewDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  });
  
  const Booking = mongoose.model('Booking', bookingSchema);

  export default Booking;