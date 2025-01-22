"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditWalletDialog } from "./edit-wallet-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function WalletList() {
  const [wallets, setWallets] = useState([]);
  const [editingWallet, setEditingWallet] = useState(null);
  const [deletingWallet, setDeletingWallet] = useState(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  async function fetchWallets() {
    try {
      const response = await fetch("/api/wallets");
      const data = await response.json();
      setWallets(data);
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
      toast.error("Failed to load wallets");
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/wallets/${deletingWallet.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete wallet");

      toast.success("Wallet deleted successfully");
      fetchWallets();
    } catch (error) {
      console.error("Failed to delete wallet:", error);
      toast.error("Failed to delete wallet");
    } finally {
      setDeletingWallet(null);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <Card key={wallet.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {wallet.name}
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingWallet(wallet)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingWallet(wallet)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>{wallet.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{wallet.balance.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}

      {editingWallet && (
        <EditWalletDialog
          wallet={editingWallet}
          open={!!editingWallet}
          onOpenChange={(open) => !open && setEditingWallet(null)}
          onSuccess={fetchWallets}
        />
      )}

      <AlertDialog open={!!deletingWallet} onOpenChange={() => setDeletingWallet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the wallet
              and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}