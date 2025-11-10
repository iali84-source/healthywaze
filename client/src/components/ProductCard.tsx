import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const price = parseFloat(product.price);
  const inStock = product.stock > 0;

  return (
    <Card
      className="group overflow-hidden hover-elevate transition-all"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <a>
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-testid={`img-product-${product.id}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            {!inStock && (
              <Badge className="absolute right-2 top-2" variant="secondary">
                Out of Stock
              </Badge>
            )}
          </div>
        </a>
      </Link>

      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <a>
            <h3
              className="line-clamp-2 text-base font-semibold leading-tight hover:text-primary"
              data-testid={`text-product-name-${product.id}`}
            >
              {product.name}
            </h3>
          </a>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 p-4 pt-0">
        <div className="flex flex-col">
          <span className="text-2xl font-bold" data-testid={`text-price-${product.id}`}>
            ${price.toFixed(2)}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-destructive">Only {product.stock} left!</span>
          )}
        </div>
        <Button
          size="default"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
