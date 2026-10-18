import { NextResponse } from 'next/server';

/** Webhook kept so Telegram does not retry; approval buttons removed — notify-only flow. */
export const POST = () => NextResponse.json({ ok: true });
