import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Clock, Zap, RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "pending" | "skipped";
  message: string;
  duration: number;
  details?: any;
}

interface HealthCheckResponse {
  timestamp: string;
  status: "healthy" | "degraded" | "unhealthy";
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

export default function DebugDashboard() {
  const [results, setResults] = useState<HealthCheckResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthCheck = useMutation({
    mutationFn: async () => {
      setIsRunning(true);
      const res = await fetch("/api/health-check", { method: "POST" });
      if (!res.ok) throw new Error("Health check failed");
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setIsRunning(false);
    },
    onError: () => {
      setIsRunning(false);
    },
  });

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/debug/reset-test-data", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "fail":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "fail":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health & Debug Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Test all system components, APIs, and data integrity with one click
        </p>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          This dashboard runs comprehensive tests on your database, API endpoints, authentication system, and data storage. Use this to verify everything is working correctly before deploying.
        </AlertDescription>
      </Alert>

      {/* CONTROL BUTTONS */}
      <div className="flex gap-3">
        <Button
          onClick={() => runHealthCheck.mutate()}
          disabled={isRunning || runHealthCheck.isPending}
          size="lg"
          className="gap-2"
        >
          <RefreshCw className={`h-5 w-5 ${isRunning ? "animate-spin" : ""}`} />
          {isRunning ? "Testing..." : "Run All Tests"}
        </Button>
        <Button
          onClick={() => resetDataMutation.mutate()}
          disabled={resetDataMutation.isPending}
          variant="outline"
          size="lg"
        >
          {resetDataMutation.isPending ? "Resetting..." : "Reset Test Data"}
        </Button>
      </div>

      {/* OVERALL STATUS */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results Summary</span>
              <Badge
                className={`text-lg px-3 py-1 ${
                  results.status === "healthy"
                    ? "bg-green-600"
                    : results.status === "degraded"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                }`}
              >
                {results.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Tested at {new Date(results.timestamp).toLocaleTimeString()} - Total time: {results.summary.duration}ms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{results.summary.total}</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{results.summary.passed}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{results.summary.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DETAILED TEST RESULTS */}
      {results && (
        <div className="space-y-3">
          {results.tests.map((test, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{test.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                      {test.details && (
                        <div className="mt-2 rounded bg-muted p-2 text-xs font-mono overflow-auto max-h-48">
                          <pre>{JSON.stringify(test.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(test.status)}>
                      {test.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">{test.duration}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* NO RESULTS YET */}
      {!results && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click "Run All Tests" to test your system
            </p>
          </CardContent>
        </Card>
      )}

      {/* INFO PANEL */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-300">What Gets Tested?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-blue-600 dark:text-blue-300">
          <p>✓ Database connectivity and schema</p>
          <p>✓ API endpoint availability</p>
          <p>✓ Authentication system</p>
          <p>✓ Storage operations (create, read, update, delete)</p>
          <p>✓ Data integrity and validation</p>
          <p>✓ Product catalog functionality</p>
          <p>✓ Order processing system</p>
          <p>✓ Site settings and branding</p>
        </CardContent>
      </Card>
    </div>
  );
}
