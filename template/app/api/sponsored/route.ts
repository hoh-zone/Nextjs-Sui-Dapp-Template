import { type NextRequest, NextResponse } from "next/server";
import { enokiClient, isEnokiEnabled } from "../EnokiClient";
import { z } from "zod";
import { isValidSuiAddress } from "@mysten/sui/utils";

const sponsorTxSchema = z.object({
  network: z.enum(["mainnet", "testnet"]),
  txBytes: z.string().min(1, "Transaction bytes cannot be empty"),
  sender: z.string().refine((val) => {
    return isValidSuiAddress(val)
  }, {
    message: "Invalid sender address"
  }),
  allowedAddresses: z.array(z.string()).optional(),
}).strict();

export async function POST(request: NextRequest) {
  if (!isEnokiEnabled) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const validatedData = sponsorTxSchema.parse(body);
    
    const response = await enokiClient!.createSponsoredTransaction({
      network: validatedData.network,
      transactionKindBytes: validatedData.txBytes,
      sender: validatedData.sender,
      allowedAddresses: validatedData.allowedAddresses,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Invalid request parameters",
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }, { status: 400 });
    }

    console.error('[Sponsored Transaction Error]:', error);
    return NextResponse.json({
      error: "Failed to create sponsored transaction",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

