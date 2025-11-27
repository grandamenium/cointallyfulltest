'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { getSourceIdFromChainId } from '@/lib/web3/config';

export function useWeb3Wallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chain, status } = useAccount();
  const { disconnect } = useDisconnect();

  const openWalletModal = async () => {
    await open();
  };

  const chainId = chain?.id;
  const sourceId = chainId ? getSourceIdFromChainId(chainId) : undefined;

  return {
    address,
    isConnected,
    chainId,
    sourceId,
    chainName: chain?.name,
    status,
    openWalletModal,
    disconnect,
  };
}
