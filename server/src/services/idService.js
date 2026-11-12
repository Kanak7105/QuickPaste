import { customAlphabet } from "nanoid";

// Alphanumeric only, so IDs are URL-safe and match /^[A-Za-z0-9]{8}$/
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const MAX_ATTEMPTS = 3;

export const generateId = customAlphabet(ALPHABET, 8);

// Runs saveFn with a fresh ID, retrying if the ID already exists (error 11000).
export async function withUniqueId(saveFn) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await saveFn(generateId());
    } catch (err) {
      if (err.code !== 11000 || attempt === MAX_ATTEMPTS) throw err;
    }
  }
}
