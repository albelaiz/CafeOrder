import { Express } from "express";
import { Server } from "http";
import { setupVite } from "./viteDev";

export async function startDevServer(app: Express, server: Server) {
  await setupVite(app, server);
}
