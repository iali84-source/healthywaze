import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { AnalyticsData } from "@shared/schema";

interface FinancialSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  totalShippingCost: number;
  totalDiscounts: number;
  orderCount: number;
}

export default function Accounting() {
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const { data: financialSummary } = useQuery<FinancialSummary>({
    queryKey: ["/api/accounting/summary"],
  });

  // Mock data for charts (in production, this would come from the backend)
  const revenueByMonth = [
    { month: "Jan", revenue: 4000, cost: 2400, profit: 1600 },
    { month: "Feb", revenue: 3000, cost: 1398, profit: 1602 },
    { month: "Mar", revenue: 2000, cost: 9800, profit: -7800 },
    { month: "Apr", revenue: 2780, cost: 3908, profit: -1128 },
    { month: "May", revenue: 1890, cost: 4800, profit: -2910 },
    { month: "Jun", revenue: 2390, cost: 3800, profit: -1410 },
    { month: "Jul", revenue: 3490, cost: 4300, profit: -810 },
  ];

  const profitByProduct = [
    { name: "Vitamin D3", value: 2500, profit: 850 },
    { name: "Omega-3", value: 2100, profit: 720 },
    { name: "Probiotics", value: 1800, profit: 580 },
    { name: "Multivitamin", value: 1500, profit: 450 },
    { name: "Other", value: 800, profit: 200 },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const summary = financialSummary || {
    totalRevenue: analytics?.totalRevenue || 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    totalShippingCost: 0,
    totalDiscounts: 0,
    orderCount: analytics?.totalOrders || 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Accounting & Financial Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Track revenue, costs, profits, and shipping expenses
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-revenue">
              ${summary.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {summary.orderCount} orders
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-cost">
              ${summary.totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Product + Shipping costs
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-profit">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="text-total-profit">
              ${summary.totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue - Costs
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-profit-margin">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-profit-margin">
              {summary.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Profitability ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue, Cost, Profit Over Time */}
      <Card data-testid="card-revenue-chart">
        <CardHeader>
          <CardTitle>Revenue vs Cost vs Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
              <Bar dataKey="cost" fill="#ef4444" name="Cost" />
              <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profit Trend */}
        <Card data-testid="card-profit-trend">
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit by Product */}
        <Card data-testid="card-profit-by-product">
          <CardHeader>
            <CardTitle>Profit Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profitByProduct}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="profit"
                >
                  {profitByProduct.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card data-testid="card-expense-breakdown">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium" data-testid="text-shipping-cost-label">Shipping Cost</span>
              <span className="font-bold" data-testid="text-shipping-cost">
                ${summary.totalShippingCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium" data-testid="text-discount-label">Total Discounts Given</span>
              <span className="font-bold" data-testid="text-discount">
                ${summary.totalDiscounts.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium" data-testid="text-total-cost-label">Total Product Cost</span>
              <span className="font-bold" data-testid="text-total-product-cost">
                ${(summary.totalCost - summary.totalShippingCost).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
