import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SuiGraphQLClient } from "@mysten/sui/graphql";

type NetworkVariables = typeof devnetVariables | typeof testnetVariables | typeof mainnetVariables;

function getNetworkVariables() {
    if (network === "mainnet") return mainnetVariables;
    if (network === "testnet") return testnetVariables;
    return devnetVariables;
}


type Network = "devnet" | "testnet" | "mainnet"

const devnetVariables = {
    package: process.env.DEVNET_PACKAGE_ID
}

const testnetVariables = {
    package: process.env.TESTNET_PACKAGE_ID
}

const mainnetVariables = {
    package: process.env.MAINNET_PACKAGE_ID
}

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
const graphqlClient = new SuiGraphQLClient({ url: `https://sui-${network}.mystenlabs.com/graphql` });
export { suiClient, graphqlClient, getNetworkVariables };
export type { NetworkVariables, Network };