import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: 2,
    maxlength: 50,
  },
  cognome: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    select: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  dataDiNascita: {
    type: String,
  },
  avatar: {
    type: String,
  },
  avatarPublicId: {
    type: String,
  },
  googleCalendar: {
    connected: {
      type: Boolean,
      default: false,
    },
    accountEmail: {
      type: String,
      default: null,
    },
    calendarId: {
      type: String,
      default: "primary",
    },
    refreshTokenEncrypted: {
      type: String,
      default: null,
      select: false,
    },
    syncToken: {
      type: String,
      default: null,
      select: false,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    oauthStateHash: {
      type: String,
      default: null,
      select: false,
    },
    oauthStateExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
});

userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (e) {
    throw e;
  }
});

const User = mongoose.model("User", userSchema);

export default User;
