import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Return = {
  id: number;
  orderId: string;
  returnNumber: string;
  reason: string;
  status: string;
  refundMethod: string | null;
  refundAmount: string | null;
  customerNotes: string | null;
  createdAt: string;
  processedAt: string | null;
};

export default function Returns() {
  const { toast } = useToast();

  const { data: returns = [], isLoading } = useQuery<Return[]>({
    queryKey: ["/api/admin/returns"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, refundMethod }: { id: number; status: string; refundMethod?: string }) =>
      apiRequest("PATCH", `/api/admin/returns/${id}`, { status, refundMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/returns"] });
      toast({ title: "Return updated" });
    },
  });

  const processMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/returns/${id}/process`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/returns"] });
      toast({ title: "Return processed and refund issued" });
    },
    onError: () => {
      toast({ title: "Failed to process return", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "requested": return <Badge variant="outline">Requested</Badge>;
      case "approved": return <Badge>Approved</Badge>;
      case "received": return <Badge variant="secondary">Received</Badge>;
      case "refunded": return <Badge className="bg-green-600">Refunded</Badge>;
      case "declined": return <Badge variant="destructive">Declined</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingReturns = returns.filter(r => r.status === "requested").length;
  const approvedReturns = returns.filter(r => r.status === "approved" || r.status === "received").length;
  const completedReturns = returns.filter(r => r.status === "refunded").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Returns & Refunds</h1>
        <p className="text-muted-foreground">Manage customer return requests</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{returns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{pendingReturns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{approvedReturns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedReturns}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : returns.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No return requests</p>
              <p className="text-sm text-muted-foreground">Customer return requests will appear here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <Card key={ret.id} data-testid={`card-return-${ret.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-lg">{ret.returnNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">Order: {ret.orderId}</p>
                </div>
                {getStatusBadge(ret.status)}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-medium">{ret.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Refund Amount</p>
                    <p className="font-medium">{ret.refundAmount ? `$${parseFloat(ret.refundAmount).toFixed(2)}` : "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{format(new Date(ret.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                
                {ret.customerNotes && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Customer Notes</p>
                    <p className="text-sm">{ret.customerNotes}</p>
                  </div>
                )}

                {ret.status === "requested" && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: ret.id, status: "approved" })}
                      disabled={updateMutation.isPending}
                      data-testid={`button-approve-${ret.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateMutation.mutate({ id: ret.id, status: "declined" })}
                      disabled={updateMutation.isPending}
                      data-testid={`button-decline-${ret.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}

                {ret.status === "approved" && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Mark as received when item arrives</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ id: ret.id, status: "received" })}
                      disabled={updateMutation.isPending}
                    >
                      Mark Received
                    </Button>
                  </div>
                )}

                {ret.status === "received" && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Select
                      onValueChange={(value) => updateMutation.mutate({ id: ret.id, status: "received", refundMethod: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Refund Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original_payment">Original Payment</SelectItem>
                        <SelectItem value="store_credit">Store Credit</SelectItem>
                        <SelectItem value="gift_card">Gift Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => processMutation.mutate(ret.id)}
                      disabled={processMutation.isPending || !ret.refundMethod}
                      data-testid={`button-process-${ret.id}`}
                    >
                      {processMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      Process Refund
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
