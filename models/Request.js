const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  problem: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  hemoglobin: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  
  // রক্তদানের তারিখ (Date টাইপ করা হলো)
  donationDate: { type: Date, required: true },
  
  location: { type: String, required: true },
  contactPhone: { type: String, required: true },
  reference: { type: String, default: '' },
  urgency: { 
    type: String, 
    enum: ['Critical', 'Normal'], 
    default: 'Normal' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Completed'], 
    default: 'Pending' 
  },

  // ডোনারদের রেসপন্স
  responses: [
    {
      donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      donorPhone: { type: String },
      sharePhoneWithRequester: { type: Boolean, default: true },
      message: { type: String }, 
      status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected'], 
        default: 'Pending' 
      },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  // ইন-অ্যাপ প্রাইভেট চ্যাট
  chatMessages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);