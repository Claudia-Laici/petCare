import { randomBytes, createHash } from "node:crypto";
import AppointmentShare from "../modules/appointmentShare/AppointmentShare.js";

export const generateShareToken = () => {
  const token = randomBytes(32).toString("hex");

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  return { token, tokenHash };
};

export const findValidShare = async (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const share = await AppointmentShare.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select("+tokenHash");

  return share;
};
