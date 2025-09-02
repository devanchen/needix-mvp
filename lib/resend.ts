﻿// lib/resend.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";
