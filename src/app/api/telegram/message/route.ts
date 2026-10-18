import { getTelegramConfig, sendTelegramNotify } from '@/server/telegram-bot';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
    try {
        const body = (await req.json()) as {
            message?: string;
            message_id?: number | null;
        };

        const message = body.message;
        const message_id = body.message_id ?? null;

        if (typeof message !== 'string' || !message.trim() || message.length > 4096) {
            return NextResponse.json({ success: false, message_id: null });
        }
        if (message_id !== null && (!Number.isInteger(message_id) || message_id <= 0)) {
            return NextResponse.json({ success: false, message_id: null });
        }

        const { token, chatId } = getTelegramConfig();
        if (!token || !chatId) {
            return NextResponse.json({ success: false, message_id: null });
        }

        const newId = await sendTelegramNotify({
            token,
            chatId,
            message,
            previousMessageId: message_id
        });

        if (newId === null) {
            return NextResponse.json({ success: false, message_id: null });
        }

        return NextResponse.json({ success: true, message_id: newId });
    } catch {
        return NextResponse.json({ success: false, message_id: null });
    }
};
