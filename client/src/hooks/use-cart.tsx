import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

type CartItem = {
  id: number;
  cartId: string;
  productId: number;
  variantId: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product?: Product | null;
};

type Cart = {
  id: string;
  userId: number | null;
  sessionToken: string | null;
  notes: string | null;
  subtotal: string;
  discountAmount: string;
  total: string;
  status: string;
};

type CartContextType = {
  cart: Cart | null;
  items: CartItem[];
  isLoading: boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  sessionToken: string;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_SESSION_KEY = "cart_session_token";

function getSessionToken(): string {
  let token = localStorage.getItem(CART_SESSION_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, token);
  }
  return token;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cartOpen, setCartOpen] = useState(false);
  const [sessionToken] = useState(getSessionToken);

  const { data: cartData, isLoading } = useQuery<{ cart: Cart; items: CartItem[] }>({
    queryKey: ['/api/cart', user?.id, sessionToken],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (!user) {
        headers['x-cart-session'] = sessionToken;
      }
      const res = await fetch('/api/cart', {
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch cart');
      return res.json();
    },
  });

  const [lastMergedUserId, setLastMergedUserId] = useState<number | null>(null);

  const [mergeAttempts, setMergeAttempts] = useState(0);
  const MAX_MERGE_ATTEMPTS = 3;

  const mergeMutation = useMutation({
    mutationFn: async () => {
      // The merge endpoint is safe - it only merges if the session cart has items
      const res = await apiRequest('POST', '/api/cart/merge', { sessionToken });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      if (user?.id) {
        setLastMergedUserId(user.id);
      }
      setMergeAttempts(0);
      // Show feedback when items were merged
      if (data?.merged && data?.itemsMerged > 0) {
        toast({
          title: "Cart synced",
          description: `${data.itemsMerged} item(s) from your previous session have been added.`,
        });
      }
    },
    onError: () => {
      const attempts = mergeAttempts + 1;
      setMergeAttempts(attempts);
      
      if (attempts >= MAX_MERGE_ATTEMPTS) {
        // Give up after max attempts - mark as merged to stop retrying
        if (user?.id) {
          setLastMergedUserId(user.id);
        }
        toast({
          title: "Cart sync failed",
          description: "Unable to sync your cart. Please refresh if you're missing items.",
          variant: "destructive",
        });
      } else {
        // Will retry on next render cycle
        toast({
          title: "Cart sync issue",
          description: `Retrying... (${attempts}/${MAX_MERGE_ATTEMPTS})`,
        });
      }
    },
  });

  useEffect(() => {
    // Reset merged state when user logs out
    if (!user) {
      setLastMergedUserId(null);
      setMergeAttempts(0);
    }
  }, [user]);

  useEffect(() => {
    // Merge cart when user logs in and we haven't merged for this user yet
    // The backend merge endpoint is safe - it checks if session cart has items first
    const shouldMerge = user && sessionToken && user.id !== lastMergedUserId && !mergeMutation.isPending;
    
    if (shouldMerge) {
      mergeMutation.mutate();
    }
  }, [user?.id, sessionToken, lastMergedUserId, mergeMutation.isPending, mergeAttempts]);

  const addMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId }: { productId: number; quantity: number; variantId?: string }) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (!user) {
        headers['x-cart-session'] = sessionToken;
      }
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ productId, quantity, variantId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add to cart');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (!user) {
        headers['x-cart-session'] = sessionToken;
      }
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error('Failed to update cart');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const headers: Record<string, string> = {};
      if (!user) {
        headers['x-cart-session'] = sessionToken;
      }
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove from cart');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const headers: Record<string, string> = {};
      if (!user) {
        headers['x-cart-session'] = sessionToken;
      }
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to clear cart');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const addToCart = useCallback(async (product: Product, quantity = 1, variantId?: string) => {
    try {
      await addMutation.mutateAsync({ productId: parseInt(product.id), quantity, variantId });
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} added to cart`,
      });
      setCartOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  }, [addMutation, toast]);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    try {
      await updateMutation.mutateAsync({ itemId, quantity });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    }
  }, [updateMutation, toast]);

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      await removeMutation.mutateAsync(itemId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  }, [removeMutation, toast]);

  const clearCart = useCallback(async () => {
    try {
      await clearMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  }, [clearMutation, toast]);

  const items = cartData?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart: cartData?.cart || null,
        items,
        isLoading,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        sessionToken,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
