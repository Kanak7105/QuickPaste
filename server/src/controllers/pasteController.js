import * as pasteService from "../services/pasteService.js";

const NOT_FOUND = { error: "Paste not found or expired" };

export async function create(req, res) {
  const result = await pasteService.createPaste(req.body);
  res.status(201).json(result);
}

export async function getOne(req, res) {
  const paste = await pasteService.getPaste(req.params.id);
  if (!paste) return res.status(404).json(NOT_FOUND);
  res.set("Cache-Control", "no-store").json(paste);
}

export async function unlock(req, res) {
  const paste = await pasteService.unlockPaste(req.params.id, req.body.password);
  if (!paste) return res.status(404).json(NOT_FOUND);
  res.set("Cache-Control", "no-store").json(paste);
}

export async function raw(req, res) {
  const content = await pasteService.getRawPaste(req.params.id);
  if (content === null) return res.status(404).type("text/plain").send(NOT_FOUND.error);
  res.set("Cache-Control", "no-store").type("text/plain").send(content);
}

export function health(req, res) {
  res.json({ status: "ok" });
}
