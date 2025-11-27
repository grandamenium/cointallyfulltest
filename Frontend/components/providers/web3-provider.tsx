'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, type State } from 'wagmi';
import { projectId, wagmiConfig, chains } from '@/lib/web3/config';

let web3ModalInitialized = false;

function initializeWeb3Modal() {
  if (web3ModalInitialized || !projectId || typeof window === 'undefined') return;

  createWeb3Modal({
    wagmiConfig,
    projectId,
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#6366f1',
    },
  });

  web3ModalInitialized = true;
}

interface Web3ProviderProps {
  children: ReactNode;
  initialState?: State;
}

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeWeb3Modal();
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      {mounted ? children : null}
    </WagmiProvider>
  );
}
