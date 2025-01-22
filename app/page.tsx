import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Shield, Wallet2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold">HostelHive</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/signup">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Smart Budget Tracking for Students
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Take control of your finances with our intuitive budget tracking app designed specifically for hostel and college students.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4">
                <Wallet2 className="h-12 w-12" />
                <h3 className="text-xl font-bold">Multiple Wallets</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Manage cash, bank accounts, and UPI payments in one place.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <BarChart2 className="h-12 w-12" />
                <h3 className="text-xl font-bold">Expense Analytics</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Visualize your spending patterns with detailed charts and insights.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Shield className="h-12 w-12" />
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Your financial data is encrypted and protected.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 HostelHive. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}