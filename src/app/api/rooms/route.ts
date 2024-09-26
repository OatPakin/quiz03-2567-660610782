import { DB, Payload, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { originalDB } from "@lib/DB";

export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms: originalDB.rooms,
    totalRooms: originalDB.rooms.length,
  });
};

export const POST = async (request: NextRequest) => {
  const payload = checkToken();
  const body: { roomName: string } = await request.json();
 
  let role = null;

  try {
    role = (<Payload>payload).role || null;
  } catch {
     return NextResponse.json(
    {
      ok: false,
      message: "Invalid token",
    },
    { status: 401 }
  );
  }

  readDB();
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    const foundAD = originalDB.rooms.find((room) => room.roomName === body.roomName);
    if (foundAD) {
     return NextResponse.json(
    {
      ok: false,
      message: `Room ${body.roomName} already exists`,
    },
    { status: 400 }
  );
    }

  const roomId = nanoid();
  originalDB.rooms.push({ roomId: roomId, roomName: body.roomName });

  //call writeDB after modifying Database
  writeDB();
  return NextResponse.json({
    ok: true,
    roomId,
    message: `Room ${body.roomName} has been created`,
  });
  };

};
