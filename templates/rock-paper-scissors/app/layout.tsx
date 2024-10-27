import React from "react";
import type {Metadata} from "next";
import "./globals.css";
import {geistSans, geistMono} from "./fonts";
import {Providers} from "./providers";

export const metadata: Metadata = {
    title: "Rock Paper Scissors",
    description: "Classic Game: Rock Paper Scissors",
    icons: "/logo/logo.jpeg"
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
