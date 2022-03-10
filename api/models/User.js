const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  email: String,
  // verifcation token (user verified by admin)
  approvedAt: Schema.Types.Date,
  approvedBy: String,
  approvedLevel: Number, // 0: blocked, 1: verified, 2: admin, 3: super admin
  approval_tokens: {
    tokens: [ String ], // token, token, token, token
    expires: Number,
  },
  login_token: {
    token: String,
    expires: Number
  },
}, {
  timestamps: true
});

module.exports = model('User', userSchema);
