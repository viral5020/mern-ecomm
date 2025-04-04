import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useSelector } from "react-redux"; // Import useSelector to get the selected currency and exchange rates

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const { currency, exchangeRates } = useSelector((state) => state.currency); // Get currency and exchange rates from the store

  // Convert price based on selected currency
  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price; // Return price as is if no exchange rate or currency available
    }
    return (price * exchangeRates[currency]).toFixed(2); // Convert price and format it
  };

  // Calculate total cart amount
  const totalCartAmount =
    Array.isArray(cartItems) && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) => {
            // Ensure currentItem is valid
            if (!currentItem) return sum;
            const price = currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price;
            return sum + (price * (currentItem?.quantity || 1)); // Add item price * quantity
          },
          0
        )
      : 0;

  // Calculate total weight from each product's actual weight
  const totalWeight =
    Array.isArray(cartItems) && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
          // Ensure currentItem and productId are valid
          if (!currentItem || !currentItem.weight) return sum; // Use the weight directly from the cartItem
          const itemWeight = currentItem.weight; // Now using the weight from the product data populated from the backend
          return sum + itemWeight * (currentItem?.quantity || 1); // Sum the weight based on quantity
        }, 0)
      : 0;

  // Calculate shipping charges (150 Rs per kg)
  const shippingCharges = totalWeight * 150; // 150 Rs per kg for shipping

  // Convert total cart amount and shipping charges based on selected currency
  const totalCartAmountInCurrency = convertPrice(totalCartAmount);
  const shippingChargesInCurrency = convertPrice(shippingCharges);

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>

      {/* Scrollable Cart Items Section */}
      <div className="mt-8 space-y-4 max-h-72 overflow-y-auto">
        {Array.isArray(cartItems) && cartItems.length > 0
          ? cartItems.map((item, index) => (
              <UserCartItemsContent key={index} cartItem={item} />
            ))
          : null}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">{currency} {totalCartAmountInCurrency}</span>
        </div>

        {/* Add Shipping Charges */}
        <div className="flex justify-between">
          <span className="font-bold">Shipping Charges</span>
          <span className="font-bold">{currency} {shippingChargesInCurrency}</span>
        </div>

        {/* Display total amount with shipping charges */}
        <div className="flex justify-between mt-4">
          <span className="font-bold">Total with Shipping</span>
          <span className="font-bold">{currency} {(parseFloat(totalCartAmountInCurrency) + parseFloat(shippingChargesInCurrency)).toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={() => {
          navigate("/shop/checkout");  // Navigate to checkout page
          setOpenCartSheet(false);  // Close the cart sheet
        }}
        className="w-full mt-6"
      >
        Checkout
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
