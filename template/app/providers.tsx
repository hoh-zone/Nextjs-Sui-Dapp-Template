'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig, network } from "@/contracts"
import "@mysten/dapp-kit/dist/index.css";
import { useEffect } from "react";
import { initializeAllDecoders } from "@/utils/registerDecoders";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // 初始化 decoders
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAllDecoders();
        console.log('✅ Decoders initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize decoders:', error);
        // 注意：这里不抛出错误，让应用继续运行
      }
    };

    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
