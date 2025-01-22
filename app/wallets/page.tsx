"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletList } from "@/components/wallets/wallet-list";
import { AddWalletDialog } from "@/components/wallets/add-wallet-dialog";

export default function WalletsPage() {
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Wallets</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddWalletOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Wallet
          </Button>
        </div>
      </div>
      <WalletList />
      <AddWalletDialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen} />
    </div>
  );
}