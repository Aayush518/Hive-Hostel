"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Trash2, AlertCircle } from "lucide-react";
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
import { format } from "date-fns";
import { useSession } from "next-auth/react";

export function LoanList() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState([]);
  const [deletingLoan, setDeletingLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  async function fetchLoans() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/loans");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load loans");
      }
      
      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      setError(error.message);
      toast.error("Failed to load loans: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(loanId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update loan status");
      }

      toast.success("Loan status updated successfully");
      fetchLoans();
    } catch (error) {
      console.error("Failed to update loan status:", error);
      toast.error("Failed to update loan status: " + error.message);
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/loans/${deletingLoan.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete loan");
      }

      toast.success("Loan deleted successfully");
      fetchLoans();
    } catch (error) {
      console.error("Failed to delete loan:", error);
      toast.error("Failed to delete loan: " + error.message);
    } finally {
      setDeletingLoan(null);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading loans...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Lender</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Guarantor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No loans found
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.description}</TableCell>
                <TableCell>₹{loan.amount.toLocaleString()}</TableCell>
                <TableCell>
                  {loan.dueDate ? format(new Date(loan.dueDate), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell>{loan.lender.name}</TableCell>
                <TableCell>{loan.borrower.name}</TableCell>
                <TableCell>{loan.guarantor?.name || "N/A"}</TableCell>
                <TableCell>{getStatusBadge(loan.status)}</TableCell>
                <TableCell className="text-right">
                  {loan.status === "PENDING" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(loan.id, "PAID")}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(loan.id, "OVERDUE")}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  {session?.user?.id === loan.lenderId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingLoan(loan)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deletingLoan}
        onOpenChange={() => setDeletingLoan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the loan
              record.
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