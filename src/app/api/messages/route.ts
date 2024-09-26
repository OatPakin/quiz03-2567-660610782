import { DB, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { originalDB } from "@lib/DB";
import { Payload } from "@lib/DB";


export const GET = async (request: NextRequest) => {
  const roomId = request.nextUrl.searchParams.get("roomId");
  readDB();
  
  const foundMessage = originalDB.messages.find((message) => message.roomId === roomId);
  if (!foundMessage) {
    return NextResponse.json(
      {
        ok: false,
        message: "Room is not found",
      },{ 
        status: 404 
      });
  }
  let filtered = originalDB.messages;
  filtered = filtered.filter((messages) => messages.roomId === roomId);
  return NextResponse.json({
    ok: true,
    messages: filtered,
  });
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  readDB();
  const foundRoom = originalDB.rooms.find((room) => room.roomId === body.roomId);
  if (!foundRoom) {
    return NextResponse.json(
      {
        ok: false,
        message: "Room is not found",
      },{ 
        status: 404 
      });
  }

  const messageId = nanoid();

  originalDB.messages.push({
    roomId: body.roomId,
    messageId: messageId,
    messageText: body.messageText,
  });


  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const body = await request.json();
  const payload = checkToken();
  let role = "";

  try {
    role = (<Payload>payload).role; 
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },{ 
        status: 401 
      });
  }
  readDB();
  if (role === "SUPER_ADMIN") {
    const foundMessagetu = originalDB.messages.find(
      (message) => message.messageId === body.messageId
    );
    if (!foundMessagetu) {
     return NextResponse.json(
    {
      ok: false,
      message: "Message is not found",
    },
    { status: 404 }
  );
    }
  originalDB.messages = originalDB.messages.filter(
      (messages) => messages.messageId !== body.messageId
  );


  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
  }else {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },{ 
        status: 401 
      });
  }
};
