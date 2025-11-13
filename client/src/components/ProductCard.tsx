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
      className="group overflow-hidden hover-elevate transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              data-testid={`img-product-${product.id}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/5" />
          
          {product.category && (
            <Badge 
              className="absolute left-3 top-3" 
              variant="secondary"
              data-testid={`badge-category-${product.id}`}
            >
              {product.category}
            </Badge>
          )}
          
          {!inStock && (
            <Badge className="absolute right-3 top-3 bg-destructive text-destructive-foreground">
              Out of Stock
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-5">
        <Link href={`/product/${product.id}`}>
          <h3
            className="line-clamp-2 text-lg font-semibold leading-snug transition-colors hover:text-primary"
            data-testid={`text-product-name-${product.id}`}
          >
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-2xl font-bold" data-testid={`text-price-${product.id}`}>
            ${price.toFixed(2)}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs font-medium text-destructive">
              Only {product.stock} left!
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          className="w-full"
          size="default"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
