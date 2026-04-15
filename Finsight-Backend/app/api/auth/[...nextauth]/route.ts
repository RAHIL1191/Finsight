// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// NextAuth returns a handler that handles all HTTP methods.
// In App Router we must export GET and POST explicitly.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };