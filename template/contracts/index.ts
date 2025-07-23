import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getContractConfig } from "./config";

type NetworkVariables = ReturnType<typeof useNetworkVariables>;

function getNetworkVariables(network: Network) {
    return networkConfig[network].variables;
}

type Network = "devnet" | "testnet" | "mainnet"

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const { networkConfig, useNetworkVariables } = createNetworkConfig({
    devnet: {
        url: getFullnodeUrl("devnet"),
        variables: getContractConfig("devnet"),
    },
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: getContractConfig("testnet"),
    },
    mainnet: {
        url: getFullnodeUrl("mainnet"),
        variables: getContractConfig("mainnet"),
    }
});

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: networkConfig[network].url });

export { getNetworkVariables, networkConfig, network, suiClient,useNetworkVariables };
export type { NetworkVariables };

