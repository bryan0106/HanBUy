export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Boxes
          </h3>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending Invoices
          </h3>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Items
          </h3>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Spent
          </h3>
          <p className="mt-2 text-2xl font-bold">₱0.00</p>
        </div>
      </div>
    </div>
  );
}

