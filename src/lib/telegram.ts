'use client';

export const sendMessage = async (payload: {
    message: string;
    message_id?: number | null;
}): Promise<number | null> => {
    const { message, message_id = null } = payload ?? {};
    if (typeof message !== 'string' || !message.trim() || message.length > 4096) {
        return null;
    }
    if (message_id !== null && message_id !== undefined && (!Number.isInteger(message_id) || message_id <= 0)) {
        return null;
    }

    try {
        const res = await fetch('/api/telegram/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                message_id
            })
        });
        const data = (await res.json()) as { success?: boolean; message_id?: number | null };
        if (!data.success) return null;
        return typeof data.message_id === 'number' ? data.message_id : null;
    } catch {
        return null;
    }
};
