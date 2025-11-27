'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionSource, ConnectionType } from '@/types/wallet';
import { ArrowLeft, Key, Upload, Wallet, AlertCircle, Loader2, Download, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import { getSourceIdFromChainId } from '@/lib/web3/config';

interface ConnectionMethodSelectorProps {
  source: ConnectionSource;
  onConnect: (connectionType: ConnectionType, credentials: Record<string, string>) => Promise<void>;
  onBack: () => void;
  onWalletConnecting?: (isConnecting: boolean) => void;
}

export function ConnectionMethodSelector({ source, onConnect, onBack, onWalletConnecting }: ConnectionMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<ConnectionType | null>(null);

  const handleMethodSelect = (method: ConnectionType) => {
    setSelectedMethod(method);
  };

  if (!selectedMethod) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Connect {source.name}</h2>
            <p className="text-sm text-muted-foreground">Choose your connection method</p>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {source.connectionMethods.includes('api-key') && (
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
              onClick={() => handleMethodSelect('api-key')}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">API Key</h3>
                  <p className="text-sm text-muted-foreground">Connect using your API credentials</p>
                </div>
                <Badge variant="secondary">Recommended</Badge>
              </CardContent>
            </Card>
          )}

          {source.connectionMethods.includes('wallet-connect') && (
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
              onClick={() => handleMethodSelect('wallet-connect')}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Wallet Connect</h3>
                  <p className="text-sm text-muted-foreground">Connect your wallet directly</p>
                </div>
              </CardContent>
            </Card>
          )}

          {source.connectionMethods.includes('csv-upload') && (
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
              onClick={() => handleMethodSelect('csv-upload')}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">CSV Upload</h3>
                  <p className="text-sm text-muted-foreground">Upload a transaction history file</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Render the appropriate connection flow based on selected method
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedMethod(null)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Connect {source.name}</h2>
          <Badge variant="outline" className="mt-1">
            {selectedMethod}
          </Badge>
        </div>
      </div>

      {selectedMethod === 'api-key' && (
        <ApiKeyFlow source={source} onConnect={onConnect} onCancel={() => setSelectedMethod(null)} />
      )}

      {selectedMethod === 'wallet-connect' && (
        <WalletConnectFlow source={source} onConnect={onConnect} onCancel={() => setSelectedMethod(null)} onWalletConnecting={onWalletConnecting} />
      )}

      {selectedMethod === 'csv-upload' && (
        <CsvUploadFlow source={source} onConnect={onConnect} onCancel={() => setSelectedMethod(null)} />
      )}
    </div>
  );
}

// API Key Flow Component
function ApiKeyFlow({
  source,
  onConnect,
  onCancel,
}: {
  source: ConnectionSource;
  onConnect: (connectionType: ConnectionType, credentials: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey || !apiSecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await onConnect('api-key', {
        apiKey,
        apiSecret,
        ...(passphrase && { passphrase }),
      });
      toast.success(`${source.name} connected successfully!`);
    } catch (error) {
      toast.error('Failed to connect. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enter your {source.name} API credentials below. These will be encrypted and stored securely.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">
            API Key <span className="text-destructive">*</span>
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiSecret">
            API Secret <span className="text-destructive">*</span>
          </Label>
          <Input
            id="apiSecret"
            type="password"
            placeholder="Enter your API secret"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passphrase">Passphrase (Optional)</Label>
          <Input
            id="passphrase"
            type="password"
            placeholder="Enter passphrase if required"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="readonly" checked disabled />
        <label htmlFor="readonly" className="text-sm text-muted-foreground">
          Read-only access (recommended for security)
        </label>
      </div>

      <Button type="button" variant="link" className="p-0 h-auto" onClick={() => setShowHelp(!showHelp)}>
        {showHelp ? 'Hide' : 'Show'} help - How to create API keys
      </Button>

      {showHelp && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">How to create {source.name} API keys:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Log in to your {source.name} account</li>
              <li>Navigate to Settings → API</li>
              <li>Create a new API key with read-only permissions</li>
              <li>Copy your API key and secret</li>
              <li>Paste them in the fields above</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !apiKey || !apiSecret} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect'
          )}
        </Button>
      </div>
    </form>
  );
}

// Wallet Connect Flow Component
function WalletConnectFlow({
  source,
  onConnect,
  onCancel,
  onWalletConnecting,
}: {
  source: ConnectionSource;
  onConnect: (connectionType: ConnectionType, credentials: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  onWalletConnecting?: (isConnecting: boolean) => void;
}) {
  const [manualAddress, setManualAddress] = useState('');
  const [label, setLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [web3Connected, setWeb3Connected] = useState(false);

  const { address, isConnected, chainId, openWalletModal, disconnect } = useWeb3Wallet();
  const hasProcessedConnection = useRef(false);

  const isEvmChain = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche', 'base'].includes(source.id);

  const getAddressPattern = (sourceId: string): RegExp | null => {
    switch (sourceId) {
      case 'ethereum':
      case 'polygon':
      case 'bsc':
      case 'arbitrum':
      case 'optimism':
      case 'avalanche':
      case 'base':
        return /^0x[a-fA-F0-9]{40}$/;
      case 'bitcoin':
        return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
      case 'solana':
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      default:
        return null;
    }
  };

  const validateAddress = (addr: string): boolean => {
    const pattern = getAddressPattern(source.id);
    if (!pattern) return true;
    return pattern.test(addr.trim());
  };

  useEffect(() => {
    if (isConnected && address && isEvmChain && !hasProcessedConnection.current) {
      hasProcessedConnection.current = true;
      setWeb3Connected(true);
      setManualAddress(address);
      onWalletConnecting?.(false);
    }
  }, [isConnected, address, isEvmChain, onWalletConnecting]);

  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
      onWalletConnecting?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWeb3Connect = async () => {
    if (!isEvmChain) {
      toast.error('Web3 connection is only available for EVM chains');
      return;
    }
    hasProcessedConnection.current = false;
    onWalletConnecting?.(true);
    await openWalletModal();
  };

  const handleSubmitWeb3Address = async () => {
    if (!address) return;

    setIsLoading(true);
    setError('');

    try {
      await onConnect('wallet-connect', {
        address: address,
        ...(label && { label }),
      });
      toast.success(`${source.name} wallet connected successfully!`);
      disconnect();
    } catch (err) {
      setError('Failed to connect. Please try again.');
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualAddress.trim()) {
      setError('Please enter an address');
      return;
    }

    if (!validateAddress(manualAddress)) {
      setError(`Invalid ${source.name} address format`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConnect('wallet-connect', {
        address: manualAddress.trim(),
        ...(label && { label }),
      });
      toast.success(`${source.name} address connected successfully!`);
    } catch (err) {
      setError('Failed to connect. Please try again.');
      toast.error('Failed to connect address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWeb3 = () => {
    disconnect();
    setWeb3Connected(false);
    setManualAddress('');
    hasProcessedConnection.current = false;
    onWalletConnecting?.(false);
  };

  return (
    <div className="space-y-6 mt-6">
      {isEvmChain && (
        <>
          <Card className={web3Connected ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${web3Connected ? 'bg-green-100 dark:bg-green-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
                  {web3Connected ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {web3Connected ? 'Wallet Connected' : 'Connect Web3 Wallet'}
                  </h3>
                  {web3Connected && address ? (
                    <div className="space-y-3">
                      <p className="text-sm font-mono bg-muted rounded px-2 py-1 break-all">
                        {address}
                      </p>
                      {chainId && (
                        <p className="text-xs text-muted-foreground">
                          Connected to chain ID: {chainId}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSubmitWeb3Address} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            'Add This Wallet'
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleDisconnectWeb3}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        Connect MetaMask, Trust Wallet, Coinbase Wallet, or other Web3 wallets.
                      </p>
                      <Button size="sm" onClick={handleWeb3Connect}>
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-4">
        {!isEvmChain && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter your {source.name} wallet address below to track transactions.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="address">
            Wallet Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            type="text"
            placeholder={`Enter your ${source.name} address`}
            value={manualAddress}
            onChange={(e) => {
              setManualAddress(e.target.value);
              setError('');
              if (web3Connected) {
                setWeb3Connected(false);
              }
            }}
            required
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label (Optional)</Label>
          <Input
            id="label"
            type="text"
            placeholder="e.g., My Main Wallet"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Give this wallet a custom name for easy identification
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !manualAddress.trim()} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Address'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// CSV Upload Flow Component
function CsvUploadFlow({
  source,
  onConnect,
  onCancel,
}: {
  source: ConnectionSource;
  onConnect: (connectionType: ConnectionType, credentials: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/wallets/upload-csv/${source.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      await onConnect('csv-upload', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size.toString(),
        transactionsImported: result.data?.transactionsImported?.toString() || '0',
      });

      toast.success(`CSV uploaded! ${result.data?.transactionsImported || 0} transactions imported.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Upload a CSV file containing your transaction history from {source.name}.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              {selectedFile ? selectedFile.name : 'Drop your CSV file here, or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">Accepted format: .csv</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button type="button" variant="outline" size="sm" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      <Button type="button" variant="link" className="w-full" asChild>
        <a href="#" download>
          <Download className="mr-2 h-4 w-4" />
          Download CSV Template
        </a>
      </Button>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={isLoading || !selectedFile} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </div>
    </div>
  );
}
