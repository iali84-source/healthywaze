import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Archive, RotateCcw, Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductArchive() {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: archivedProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/archived"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/products/archived", {});
      return response.json();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) {
        return apiRequest("POST", "/api/products/restore-all", {});
      }
      return apiRequest("POST", "/api/products/restore", { productIds: ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/archived"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Products restored successfully" });
      setSelectedIds(new Set());
    },
    onError: () => {
      toast({ title: "Failed to restore products", variant: "destructive" });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(archivedProducts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newIds = new Set(selectedIds);
    if (checked) {
      newIds.add(productId);
    } else {
      newIds.delete(productId);
    }
    setSelectedIds(newIds);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Archived Products</h1>
        <p className="mt-2 text-muted-foreground">
          Manage products that are currently hidden from your storefront
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : archivedProducts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-96 text-center">
            <div>
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No archived products</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="default"
                  disabled={selectedIds.size === 0 || restoreMutation.isPending}
                  data-testid="button-restore-selected"
                >
                  {restoreMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore Selected ({selectedIds.size})
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restore products?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will make {selectedIds.size} products visible in your storefront again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => restoreMutation.mutate()}>
                    Restore
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" data-testid="button-restore-all">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restore all archived products?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will make all {archivedProducts.length} archived products visible in your storefront.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => restoreMutation.mutate()}>
                    Restore All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Archived Products ({archivedProducts.length})</CardTitle>
                  <CardDescription>Products hidden from your storefront</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.size === archivedProducts.length && archivedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                  <span className="text-sm text-muted-foreground">Select all</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {archivedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover-elevate"
                    data-testid={`product-row-${product.id}`}
                  >
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                      data-testid={`checkbox-product-${product.id}`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">${product.price}</Badge>
                        <Badge variant="secondary" data-testid={`badge-stock-${product.id}`}>
                          Stock: {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
