'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConnectionSources } from '@/hooks/useWallets';
import { ConnectionSource, ConnectionType, SourceType } from '@/types/wallet';
import { Search } from 'lucide-react';
import { ConnectionMethodSelector } from './ConnectionMethodSelector';
import { Skeleton } from '@/components/ui/skeleton';

interface AddWalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (sourceId: string, connectionType: ConnectionType, credentials: Record<string, string>) => Promise<void>;
}

export function AddWalletModal({ open, onClose, onConnect }: AddWalletModalProps) {
  const [activeTab, setActiveTab] = useState<SourceType>('blockchain');
  const [selectedSource, setSelectedSource] = useState<ConnectionSource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);

  const { data: sources, isLoading } = useConnectionSources();

  const filteredSources = sources?.filter((source) => {
    const matchesTab = source.type === activeTab;
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  }) || [];

  const handleBack = () => {
    setSelectedSource(null);
    setIsWalletConnecting(false);
  };

  const handleSourceSelect = (source: ConnectionSource) => {
    setSelectedSource(source);
  };

  const handleConnect = async (connectionType: ConnectionType, credentials: Record<string, string>) => {
    if (!selectedSource) return;
    await onConnect(selectedSource.id, connectionType, credentials);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { setIsWalletConnecting(false); onClose(); } }}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isWalletConnecting) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (isWalletConnecting) {
            e.preventDefault();
          }
        }}
      >
        <AnimatePresence mode="wait">
          {!selectedSource ? (
            <motion.div
              key="source-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">Add Wallet/Exchange</DialogTitle>
                <DialogDescription>
                  Select a platform and connect with a few clicks
                </DialogDescription>
              </DialogHeader>

              {/* Search Bar */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for a wallet, exchange, or blockchain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SourceType)} className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                  <TabsTrigger value="exchange">Exchange</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                </TabsList>

                {/* Tab Content with Loading State */}
                {isLoading ? (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-32 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    <TabsContent value="blockchain" className="mt-6">
                      <SourceGrid sources={filteredSources} onSelect={handleSourceSelect} />
                    </TabsContent>

                    <TabsContent value="exchange" className="mt-6">
                      <SourceGrid sources={filteredSources} onSelect={handleSourceSelect} />
                    </TabsContent>

                    <TabsContent value="wallet" className="mt-6">
                      <SourceGrid sources={filteredSources} onSelect={handleSourceSelect} />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              key="connection-method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ConnectionMethodSelector
                source={selectedSource}
                onConnect={handleConnect}
                onBack={handleBack}
                onWalletConnecting={setIsWalletConnecting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

interface SourceGridProps {
  sources: ConnectionSource[];
  onSelect: (source: ConnectionSource) => void;
}

function SourceGrid({ sources, onSelect }: SourceGridProps) {
  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No sources found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {sources.map((source) => (
        <motion.div
          key={source.id}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
            onClick={() => onSelect(source)}
          >
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarImage src={source.logo} alt={source.name} />
                <AvatarFallback className="bg-gradient-to-b from-[#14BEFF] to-[#3F6EFF] text-white text-xl font-bold">
                  {source.name[0]}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium text-sm mb-2">{source.name}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {source.connectionMethods.map((method) => (
                  <Badge key={method} variant="outline" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
