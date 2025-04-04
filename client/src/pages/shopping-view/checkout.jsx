import Address from "@/components/shopping-view/address";
import img from "../../assets/bann.png";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false); // New state to track Razorpay script loading
  const [paymentMethod, setPaymentMethod] = useState(null); // Track the selected payment method
  const { currency, exchangeRates } = useSelector((state) => state.currency);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate(); // Hook for navigation

  // New state for coupon
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // Store the discount amount

  // Dynamically load the Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    // When the script loads successfully
    script.onload = () => {
      setRazorpayLoaded(true); // Set flag to true when script is ready
    };

    // If there is an error loading the script
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Convert price based on selected currency
  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price; // Return price as is if no exchange rate or currency available
    }
    return (price * exchangeRates[currency]).toFixed(2); // Convert price and format it
  };

  // Total amount of cart items in USD
  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Calculate total weight (treat each product as 1 kg per item)
  const totalWeight =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce((sum, currentItem) => {
          // Ensure currentItem is valid
          if (!currentItem) return sum;
          const itemWeight = currentItem?.weight || 1;
          return sum + itemWeight * (currentItem?.quantity || 1); // Sum the weight based on quantity
        }, 0)
      : 0;

  // Conversion factor (1 USD to INR), for demonstration purposes
  const exchangeRate = 82; // Example rate (use dynamic API for real-time)

  // Convert the total amount from USD to INR and then to paise (1 INR = 100 paise)
  const totalAmountInINR = totalCartAmount * exchangeRate * 100;

  // Calculate shipping charges (150 Rs per kg)
  const shippingCharges = totalWeight * 150;

  // Convert total cart amount and shipping charges based on selected currency
  const totalCartAmountInCurrency = convertPrice(totalCartAmount);
  const shippingChargesInCurrency = convertPrice(shippingCharges);
  
  // Calculate the total amount with shipping (before discount)
  const totalAmountWithShippingInCurrency = (
    parseFloat(totalCartAmountInCurrency) + parseFloat(shippingChargesInCurrency)
  ).toFixed(2);

  // Calculate the total with discount
  const totalWithDiscount = (parseFloat(totalAmountWithShippingInCurrency) - discount).toFixed(2);

  // Handle PayPal payment
  const handleInitiatePaypalPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Set payment method to 'paypal'
    setPaymentMethod("paypal");

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!currentSelectedAddress) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }
  
    if (!razorpayLoaded) {
      console.log("Razorpay script is still loading...");
      return;
    }
  
    try {
      // Ensure you're sending the amount in paise
      const amountInPaise = (totalCartAmount + shippingCharges) * 100; // Convert total amount to paise (INR * 100)
  
      // Step 1: Get the order from your backend with the converted amount (INR to Paise)
      const response = await fetch("http://localhost:5000/create-order", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amountInPaise }), // Send amount in paise
      });
  
      const order = await response.json();
  
      if (!order) {
        throw new Error('Failed to create Razorpay order');
      }
  
      // Step 2: Configure Razorpay payment options
      const options = {
        key: 'rzp_test_GIlOKSWDgEOf6H', 
        order_id: order.id,
        name: "Viral AJudia",
        amount: order.amount, // This should be in paise (from the backend)
        currency: order.currency,
  
        handler: async function (response) {
          console.warn(response);
          await fetch("http://localhost:5000/verify-payment", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          }).then(async (res) => {
            const data = await res.json();
            console.log(data);
          }).catch((error) => {
            console.log(error);
          });
        },
  
        prefill: {
          name: "Viral A",
          email: "Viralajudia123@gmail.com",
          contact: "8104992089",
        },
  
        theme: {
          color: "#3399cc",
        },
      };
  
      const razorpay = new Razorpay(options);
      razorpay.open();
  
    } catch (error) {
      console.error("Error while handling Razorpay payment:", error);
    }
  };

  // Handle COD payment
  const handleCODPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Set payment method to 'cod'
    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      shippingCharges,
      totalWithShipping: totalCartAmount + shippingCharges, 
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price: singleCartItem?.salePrice > 0
          ? singleCartItem?.salePrice
          : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "confirmed", // Update order status to 'confirmed' for COD
      paymentMethod: "cod", // Set payment method to 'cod'
      paymentStatus: "pending", // COD doesn't need immediate payment status
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        // Send confirmation email for COD order after successful order creation
        const formData = new FormData();
        formData.append('userEmail', user?.email);
        formData.append('item', 'COD Order');
        formData.append('quantity', 1);
        formData.append('total', totalCartAmount + shippingCharges);

        fetch("http://localhost:5000/api/send-order-confirmation", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user), 
        })
          .then((response) => response.text())
          .then((emailData) => {
            if (emailData.includes("Order confirmation email sent.")) {
              toast({
                title: "Order placed successfully, confirmation email sent.",
                variant: "success",
              });
            } else {
              toast({
                title: "Order placed successfully, but failed to send email.",
                variant: "warning",
              });
            }
          })
          .catch((error) => {
            console.error("Error sending email:", error);
            toast({
              title: "Order placed successfully, but failed to send email.",
              variant: "warning",
            });
          });

        navigate("/shop/account"); // Redirect to the shop account page after successful order placement
      } else {
        toast({
          title: "Order placement failed",
          variant: "destructive",
        });
      }
    });
  };

  // PayPal Payment Flow (Direct Integration via the PayPal SDK)
  if (approvalURL && paymentMethod === "paypal") {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="mt-4 flex justify-between">
              <span>Total (In {currency}):</span>
              <span>{totalCartAmountInCurrency} {currency}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Shipping Charges:</span>
              <span>{shippingChargesInCurrency} {currency}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold">
              <span>Total with Shipping:</span>
              <span>{totalAmountWithShippingInCurrency} {currency}</span>
            </div>

            {/* Coupon Section */}
            <div className="mt-4 flex justify-between items-center">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter Coupon Code"
                className="border p-2 rounded-full w-full max-w-xs" // Make it longer and fully rounded
              />


              <Button
                onClick={() => {
                  // Example: Hardcoded coupon validation for discount
                  if (couponCode === "DISCOUNT100") {
                    setDiscount(100); // Apply 10 currency unit discount
                    toast({
                      title: "Coupon applied successfully!",
                      variant: "success",
                    });
                  } else {
                    toast({
                      title: "Invalid coupon code.",
                      variant: "destructive",
                    });
                  }
                }}
                className=" rounded-full border p-3 flex items-center justify-center"
              >
                Apply Coupon
              </Button>
            </div>

            {discount > 0 && (
              <div className="mt-2 flex justify-between font-semibold text-green-500">
                <span>Discount:</span>
                <span>-{discount} {currency}</span>
              </div>
            )}

            {/* Displaying Total After Discount */}
            <div className="mt-2 flex justify-between font-semibold text-green-500">
              <span>Total After Discount:</span>
              <span>{totalWithDiscount} {currency}</span>
            </div>
          </div>

          <div className="mt-4 w-full flex justify-between space-x-4">
            {/* PayPal Button */}
            <Button
              onClick={handleInitiatePaypalPayment}
              className="w-full rounded-full border p-3 flex items-center justify-center"
            >
              {isPaymentStart ? "Processing Paypal Payment..." : "Checkout with Paypal"}
            </Button>

            {/* Razorpay Button */}
            <Button
              onClick={handleRazorpayPayment}
              className="w-full rounded-full border p-3 flex items-center justify-center"
            >
              Checkout with Razorpay
            </Button>

            {/* COD Button */}
            <Button
              onClick={handleCODPayment}
              className="w-full rounded-full border p-3 flex items-center justify-center"
            >
              Checkout with COD
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
