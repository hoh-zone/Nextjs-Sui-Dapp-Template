import { EnokiClient } from "@mysten/enoki";

const ENOKI_SECRET_KEY = process.env.ENOKI_SECRET_KEY;

export const enokiClient = ENOKI_SECRET_KEY 
    ? new EnokiClient({ apiKey: ENOKI_SECRET_KEY })
    : null;

export const isEnokiEnabled = Boolean(ENOKI_SECRET_KEY);

