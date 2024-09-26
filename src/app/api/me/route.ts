import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Pakin Niramitsima",
    studentId: "660610782",
  });
};
