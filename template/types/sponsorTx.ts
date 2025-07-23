export interface SponsorTxRequestBody {
    network: "devnet" | "testnet" | "mainnet";
    txBytes: string;
    sender: string;
    allowedAddresses?: string[];
}

export interface CreateSponsoredTransactionApiResponse {
    bytes: string;
    digest: string;
}