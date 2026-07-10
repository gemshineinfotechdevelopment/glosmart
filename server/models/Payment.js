import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  studentName: { type: String, required: true },
  avatar: { type: String },
  course: { type: String },
  amount: { type: String, required: true },
  mode: { type: String },
  status: { type: String, enum: ['Successful', 'Pending', 'Failed'], default: 'Pending' }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
