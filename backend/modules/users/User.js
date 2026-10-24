import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  cognome: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  googleId: {
    type:String,
    unique:true,
    sparse: true,
  },
  dataDiNascita: {
    type: String,
  },
  avatar: {
    type: String,
  },
});

userSchema.pre("save", async function () {
if (!this.password || !this.isModified("password")) {
  return;
}
try {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
} catch (e) {
  throw e
}
})

const User = mongoose.model("User", userSchema);

export default User;
