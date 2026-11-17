import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const algorithm = "aes-256-gcm";

const getEncryptionKey = () => {
  const key = Buffer.from(
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY,
    "base64"
  );

  if (key.length !== 32) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY deve contenere 32 byte"
    );
  }

  return key;
};

export const encryptToken = (token) => {
  if (!token) {
    throw new Error("Token mancante");
  }

  const key = getEncryptionKey();
  const iv = randomBytes(12);

  const cipher = createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
};

export const decryptToken = (encryptedToken) => {
  if (!encryptedToken) {
    throw new Error("Token cifrato mancante");
  }

  const [ivEncoded, authTagEncoded, encrypted] =
    encryptedToken.split(".");

  if (!ivEncoded || !authTagEncoded || !encrypted) {
    throw new Error("Formato del token cifrato non valido");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivEncoded, "base64");
  const authTag = Buffer.from(authTagEncoded, "base64");

  const decipher = createDecipheriv(algorithm, key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
