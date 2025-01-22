"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanList } from "@/components/loans/loan-list";
import { AddLoanDialog } from "@/components/loans/add-loan-dialog";

export default function LoansPage() {
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddLoanOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Loan
          </Button>
        </div>
      </div>
      <LoanList />
      <AddLoanDialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen} />
    </div>
  );
}