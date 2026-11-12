import express from "express";
import helmet from "helmet";
import cors from "cors";

export function security() {
  return [
    helmet(),
    cors({ origin: process.env.CLIENT_URL }),
    // Slightly above the 100 KB content limit to leave room for the other JSON fields
    express.json({ limit: "120kb" }),
  ];
}
