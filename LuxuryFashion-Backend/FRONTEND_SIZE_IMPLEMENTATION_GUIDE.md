# Frontend Size Selection Implementation Guide

## Overview
The backend now supports product sizes with quantity tracking. When a size is added with a quantity of 10, each order reduces the quantity by 1 (or the ordered quantity). This guide will help you implement the size selection feature in the frontend.

## Backend API Changes

### 1. Product Model Structure

The Product object now includes:
```json
{
  "prod_id": 1,
  "prod_name": "Product Name",
  "sizes": {
    "S": 10,
    "M": 15,
    "L": 8,
    "36": 5,
    "38": 12
  },
  "reservedSizes": {
    "S": 2,  // Items currently in carts
    "M": 1
  }
}
```

**Available Size Enum Values:**
- XS, S, M, L, XL, XXL, XXXL
- 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52
- One Size

### 2. Cart API Changes

**Add to Cart (`POST /api/cart/add`)**
```json
{
  "productId": 1,
  "quantity": 2,
  "size": "M"  // NEW: Required if product has sizes
}
```

**Response:**
- Success: Returns cart with items
- Error: 
  - `"Size 'M' not available for this product"` - Size doesn't exist
  - `"Size 'M' has only 5 items available"` - Insufficient quantity

### 3. Order API Changes

**Place Order (`POST /api/orders/place`)**
```json
{
  "address": { ... },
  "phoneNumber": "1234567890"
}
```

The order will automatically:
- Check size availability
- Reduce size quantity by ordered quantity
- Save size in order items

**Order Item Structure:**
```json
{
  "id": 1,
  "product": { ... },
  "quantity": 2,
  "size": "M",  // NEW: Size selected
  "price": 99.99
}
```

## Frontend Implementation Steps

### Step 1: Update Product Display Component

```typescript
interface Product {
  prod_id: number;
  prod_name: string;
  sizes: Record<string, number>; // e.g., { "S": 10, "M": 15 }
  reservedSizes?: Record<string, number>; // Optional
}

// Calculate available quantity for a size
function getAvailableQuantity(product: Product, size: string): number {
  const totalQuantity = product.sizes[size] || 0;
  const reservedQuantity = product.reservedSizes?.[size] || 0;
  return Math.max(0, totalQuantity - reservedQuantity);
}

// Check if size is available
function isSizeAvailable(product: Product, size: string, requestedQuantity: number = 1): boolean {
  return getAvailableQuantity(product, size) >= requestedQuantity;
}
```

### Step 2: Create Size Selection Component

```tsx
// SizeSelector.tsx
interface SizeSelectorProps {
  product: Product;
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  quantity?: number;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  product,
  selectedSize,
  onSizeSelect,
  quantity = 1
}) => {
  const sizeOptions = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52',
    'One Size'
  ];

  const availableSizes = sizeOptions.filter(size => 
    product.sizes && product.sizes[size] > 0
  );

  return (
    <div className="size-selector">
      <label>Select Size:</label>
      <div className="size-buttons">
        {availableSizes.map(size => {
          const availableQty = getAvailableQuantity(product, size);
          const isAvailable = isSizeAvailable(product, size, quantity);
          
          return (
            <button
              key={size}
              className={`size-btn ${selectedSize === size ? 'selected' : ''} ${!isAvailable ? 'out-of-stock' : ''}`}
              onClick={() => onSizeSelect(size)}
              disabled={!isAvailable}
              title={!isAvailable ? `Only ${availableQty} available` : `${availableQty} available`}
            >
              {size}
              {availableQty <= 5 && (
                <span className="low-stock"> ({availableQty})</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedSize && (
        <p className="availability-info">
          {getAvailableQuantity(product, selectedSize)} available
        </p>
      )}
    </div>
  );
};
```

### Step 3: Update Add to Cart Function

```typescript
// cartService.ts
interface CartItemDto {
  productId: number;
  quantity: number;
  size?: string; // NEW: Size is now required for products with sizes
}

async function addToCart(productId: number, quantity: number, size?: string) {
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        quantity,
        size // Include size if provided
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}
```

### Step 4: Update Product Detail Page

```tsx
// ProductDetailPage.tsx
export const ProductDetailPage: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if product has sizes
    const hasSizes = product.sizes && Object.keys(product.sizes).length > 0;

    if (hasSizes && !selectedSize) {
      setError('Please select a size');
      return;
    }

    // Validate size availability
    if (selectedSize && !isSizeAvailable(product, selectedSize, quantity)) {
      const available = getAvailableQuantity(product, selectedSize);
      setError(`Only ${available} items available for size ${selectedSize}`);
      return;
    }

    try {
      await addToCart(product.prod_id, quantity, selectedSize || undefined);
      setError(null);
      // Show success message
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="product-detail">
      {/* Product info */}
      
      {product?.sizes && Object.keys(product.sizes).length > 0 && (
        <SizeSelector
          product={product}
          selectedSize={selectedSize}
          onSizeSelect={setSelectedSize}
          quantity={quantity}
        />
      )}

      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        max={selectedSize ? getAvailableQuantity(product!, selectedSize) : product?.prod_quantity}
      />

      {error && <div className="error">{error}</div>}

      <button onClick={handleAddToCart} disabled={!product || !selectedSize}>
        Add to Cart
      </button>
    </div>
  );
};
```

### Step 5: Update Cart Display

```tsx
// CartPage.tsx
export const CartPage: React.FC = () => {
  // ... existing code

  return (
    <div className="cart">
      {cartItems.map(item => (
        <div key={item.id} className="cart-item">
          <h3>{item.product.prod_name}</h3>
          {item.size && (
            <p className="item-size">Size: {item.size}</p>
          )}
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.price}</p>
        </div>
      ))}
    </div>
  );
};
```

### Step 6: Update Order History Display

```tsx
// OrderHistoryPage.tsx
export const OrderHistoryPage: React.FC = () => {
  // ... existing code

  return (
    <div className="order-history">
      {orders.map(order => (
        <div key={order.id} className="order">
          {order.items.map(item => (
            <div key={item.id} className="order-item">
              <h4>{item.product.prod_name}</h4>
              {item.size && (
                <p>Size: {item.size}</p>
              )}
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## Validation Rules

1. **Size Selection:**
   - Required if product has sizes defined
   - Must be a valid size from the enum
   - Must have available quantity

2. **Quantity Validation:**
   - Cannot exceed available quantity for selected size
   - Cannot be 0 or negative

3. **Error Handling:**
   - Display clear error messages when size is unavailable
   - Show available quantity for low stock sizes
   - Disable "Add to Cart" button if size not selected or unavailable

## CSS Styling Suggestions

```css
.size-selector {
  margin: 20px 0;
}

.size-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.size-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.size-btn:hover {
  border-color: #333;
}

.size-btn.selected {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.size-btn.out-of-stock {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: line-through;
}

.low-stock {
  font-size: 0.8em;
  color: #ff9800;
}

.availability-info {
  margin-top: 10px;
  color: #666;
  font-size: 0.9em;
}
```

## Testing Checklist

- [ ] Display all available sizes for a product
- [ ] Show available quantity for each size
- [ ] Disable out-of-stock sizes
- [ ] Require size selection before adding to cart
- [ ] Validate quantity doesn't exceed available quantity
- [ ] Display size in cart items
- [ ] Display size in order history
- [ ] Handle errors when size becomes unavailable
- [ ] Update availability after adding to cart
- [ ] Clear size selection when product changes

## Example API Responses

### Get Product
```json
GET /api/products/1
{
  "prod_id": 1,
  "prod_name": "T-Shirt",
  "sizes": {
    "S": 10,
    "M": 15,
    "L": 8
  }
}
```

### Add to Cart (Success)
```json
POST /api/cart/add
{
  "productId": 1,
  "quantity": 2,
  "size": "M"
}

Response: Cart object with items
```

### Add to Cart (Error)
```json
POST /api/cart/add
{
  "productId": 1,
  "quantity": 10,
  "size": "S"
}

Response: 400 Bad Request
{
  "error": "Size 'S' has only 5 items available"
}
```

## Notes

1. **Size Quantity Tracking:**
   - When a size is added with quantity 10, each order reduces it by the ordered quantity
   - Reserved quantity is released if item is removed from cart
   - Actual quantity is only reduced when order is placed

2. **Backward Compatibility:**
   - Products without sizes still work with general `prod_quantity`
   - Size is optional in CartItemDto for backward compatibility

3. **Real-time Updates:**
   - Consider refreshing product data after cart operations
   - Show updated availability in real-time if possible








