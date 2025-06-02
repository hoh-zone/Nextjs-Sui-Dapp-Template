import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SuiGraphQLClient } from "@mysten/sui/graphql";

type NetworkVariables = typeof mainnetVariables | typeof testnetVariables;

function getNetworkVariables() {
    return network === "mainnet" ? mainnetVariables : testnetVariables;
}


type Network = "mainnet" | "testnet"

const mainnetVariables = {
    package: process.env.MAINNET_PACKAGE_ID
}

const testnetVariables = {
    package: process.env.TESTNET_PACKAGE_ID
}

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
const graphqlClient = new SuiGraphQLClient({ url: `https://sui-${network}.mystenlabs.com/graphql` });
export { suiClient, graphqlClient, getNetworkVariables };
export type { NetworkVariables, Network };