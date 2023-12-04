import { NextResponse } from 'next/server';

export function middleware(request) {
    const { geo } = request;

    if (geo.country === "US") {
        // Redirect users from the US to the "/blocked" page
        return console.log("redirect")
    }

    // Continue with the request for users from other countries
    return NextResponse.next();
}
