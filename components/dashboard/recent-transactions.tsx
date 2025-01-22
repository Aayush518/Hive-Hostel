"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch('/api/dashboard/recent-transactions');
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    }
    fetchTransactions();
  }, []);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                transaction.type === "EXPENSE" 
                  ? "bg-red-100 dark:bg-red-900" 
                  : "bg-emerald-100 dark:bg-emerald-900"
              )}>
                {transaction.type === "EXPENSE" ? (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                )}
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.category} • {transaction.location}
                </p>
              </div>
              <div className={cn(
                "ml-auto font-medium",
                transaction.type === "EXPENSE" ? "text-red-500" : "text-emerald-500"
              )}>
                {transaction.type === "EXPENSE" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}