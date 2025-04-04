import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import StarRatingComponent from "@/components/common/star-rating";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails, fetchProductDetails } from "@/store/shop/products-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import Footer from "@/components/shopping-view/footer";
import Header from "@/components/shopping-view/header"; // adjust path if necessary
import { Truck, Gift, RefreshCcw, ArrowLeftCircle,File, MessageCircle } from 'lucide-react';
import product1Image from "@/assets/product1.webp";  // Adjust the path based on your project structure
import product2Image from "@/assets/product2.webp";
import product3Image from "@/assets/product3.webp";
import product4Image from "@/assets/product4.webp";
import GoogleReviewsSection from "@/components/shopping-view/googlereview";
import img from "../../assets/goog.png";
import { Heart } from 'lucide-react';
import Navbar from "@/components/shopping-view/navbar";

function ProductDetailsPage() {
  const { productId } = useParams(); // Get the productId from URL params
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productDetails, loading } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { user } = useSelector((state) => state.auth);

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [quantity, setQuantity] = useState(1); // Initialize quantity state
  const { toast } = useToast();

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / 
        reviews.length
      : 0;

  // Fetch product details on component mount
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId)); // Fetch product by productId
      dispatch(getReviews(productId)); // Get reviews for the product
      updateRecentlyViewed(productId); // Add the current product to recently viewed
    }
  }, [productId, dispatch]);

  // Function to update recently viewed products
  const updateRecentlyViewed = (productId) => {
    let recent = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    if (!recent.includes(productId)) {
      recent = [productId, ...recent].slice(0, 5); // Limit to last 5 viewed products
      localStorage.setItem("recentlyViewed", JSON.stringify(recent));
    }
    setRecentlyViewed(recent);
  };

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleQuantityChange(value) {
    setQuantity((prevQuantity) => {
      if (value === "increase" && quantity < productDetails?.totalStock) {
        return prevQuantity + 1;
      }
      if (value === "decrease" && quantity > 1) {
        return prevQuantity - 1;
      }
      return prevQuantity;
    });
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + quantity > getTotalStock) {
          toast({
            title: `Only ${getTotalStock} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: quantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product added to cart",
        });
      }
    });
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  function handleAddToWishlist(productDetails) {
    if (!user) {
      toast({
        title: "Please log in to add products to your wishlist",
        variant: "destructive",
      });
      return;
    }
  
    const productData = {
      userId: user.id,
      productId: productDetails._id,
      image: productDetails.image,
      title: productDetails.title,
      description: productDetails.description,
      category: productDetails.category,
      brand: productDetails.brand,
      price: productDetails.price,
      salePrice: productDetails.salePrice,
      weight: productDetails.weight,
      totalStock: productDetails.totalStock,
      averageReview: productDetails.averageReview,
    };
  
    fetch("http://localhost:5000/api/wishlist", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
      .then((response) => {
        if (!response.ok) {
          // Check if the response is OK
          return response.json().then((errorData) => {
            throw new Error(errorData.message || 'Failed to add to wishlist');
          });
        }
        return response.json(); // Read the response as JSON
      })
      .then((data) => {
        if (data.success) {
          toast({
            title: "Product added to wishlist",
          });
        } else {
          toast({
            title: data.message || 'Something went wrong',
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        toast({
          title: 'Product is already in your wishlist.',
          variant: 'destructive',
        });
      });
  }
  
  
  
  return (
    <div className="w-full py-18 px-4 overflow-auto">
      {/* Include Header component here */}
      <Navbar className="mt-0" /> {/* Remove the top margin on header */}

      {/* Product Details Section */}
      {loading ? (
        <p>Loading...</p>
      ) : productDetails ? (
        <div className="w-full mb-16">
          {/* Product Image and Info */}
          <div className="flex flex-col lg:flex-row gap-8 mb-16 w-full">
            {/* Product Image */}
            <div className="flex-1 pl-24">
              <img
                src={productDetails?.image}
                alt={productDetails?.title}
                className="w-[500px] h-[750px] object-cover rounded-lg"
              />

              {/* Sub Images Below the Main Image */}
              <div className=" pl-2 mt-8 flex justify-start gap-7">
                {[...Array(4)].map((_, index) => (
                  <img
                    key={index}
                    src={productDetails?.image} // Using the main image for sub-images
                    alt={`sub-image-${index}`}
                    className="w-[100px] h-[100px] object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-gray-400"
                  />
                ))}
              </div>
            </div>

            {/* Product Info (Table Layout) */}
            <div className="flex-1 p-4">
              <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
              <p className="text-muted-foreground text-2xl mb-5 mt-4">
                {productDetails?.description}
              </p>

              {/* Product Info Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Attribute</th>
                      <th className="px-4 py-2 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 font-semibold">Price</td>
                      <td className="px-4 py-2">
                        ${productDetails?.price}
                        {productDetails?.salePrice > 0 && (
                          <span className="text-sm line-through text-muted-foreground ml-2">
                            ${productDetails?.salePrice}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold">Category</td>
                      <td className="px-4 py-2">{productDetails?.category}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold">Brand</td>
                      <td className="px-4 py-2">{productDetails?.brand}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold">Weight</td>
                      <td className="px-4 py-2">{productDetails?.weight} kg</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold">Stock</td>
                      <td className="px-4 py-2">{productDetails?.totalStock}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-semibold">Average Rating</td>
                      <td className="px-4 py-2">
                        <StarRatingComponent rating={averageReview} />
                        ({averageReview.toFixed(2)})
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quantity Control */}
              <div className="mt-5 mb-5 flex items-center gap-4">
                <Button
                  type="button"
                  onClick={() => handleQuantityChange("decrease")}
                  disabled={quantity === 1}
                >
                  -
                </Button>
                <span className="text-xl">{quantity}</span>
                <Button
                  type="button"
                  onClick={() => handleQuantityChange("increase")}
                  disabled={quantity === productDetails?.totalStock}
                >
                  +
                </Button>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-5 mb-5">
                {productDetails?.totalStock === 0 ? (
                  <Button className="w-full opacity-60 cursor-not-allowed">
                    Out of Stock
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() =>
                      handleAddToCart(productDetails?._id, productDetails?.totalStock)
                    }
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
                <div> <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => handleAddToWishlist(productDetails)}
                >
                  <Heart className="mr-2" />
                  Add to Wishlist
                </Button></div>
              {/* Payment and Delivery Options, 7 Days Replacement, and Easy Return in 2 rows and 2 columns */}
<tr>
  <td className="px-6 py-4">
    <div className="grid grid-cols-2 gap-12">
      {/* Same Day Delivery */}
      <div className="flex items-center gap-6">
        <Truck className="text-blue-500 w-14 h-14" /> {/* Larger icon */}
        <div>
          <h3 className="font-semibold text-xl mb-2">Same Day Delivery</h3>
          <p className="text-muted-foreground text-sm">Get your product delivered today for a small extra fee.</p>
        </div>
      </div>

      {/* Free Delivery */}
      <div className="flex items-center gap-6">
        <Gift className="text-green-500 w-10 h-10" /> 
        <div>
          <h3 className="font-semibold text-xl mb-2">Free Delivery</h3>
          <p className="text-muted-foreground text-sm">Enjoy free delivery on orders over $50.</p>
        </div>
      </div>
    </div>
  </td>
</tr>

<tr>
  <td className="px-6 py-4">
    <div className="grid grid-cols-2 gap-12">
      {/* 7 Days Replacement */}
      <div className="flex items-center gap-6">
        <RefreshCcw className="text-yellow-500 w-20 h-20" /> 
        <div>
          <h3 className="font-semibold text-xl mb-2">7 Days Replacement</h3>
          <p className="text-muted-foreground text-sm">If you're not satisfied with your purchase, you can replace it within 7 days.</p>
        </div>
      </div>

      {/* Easy Return */}
      <div className="flex items-center gap-6">
        <ArrowLeftCircle className="text-red-500 w-20 h-20" /> {/* Larger icon */}
        <div>
          <h3 className="font-semibold text-xl mb-2">Easy Return</h3>
          <p className="text-muted-foreground text-sm">Return the product within 14 days if you're not completely satisfied with your purchase.</p>
        </div>
      </div>
    </div>
  </td>
</tr>

                {/* WhatsApp Inquiry Section */}
                <tr>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-6">
                      <MessageCircle className="text-green-500 w-10 h-10" /> {/* WhatsApp icon */}
                      <div>
                        <h3 className="font-semibold text-xl mb-2">Have Questions? Chat with Us on WhatsApp!</h3>
                        <p className="text-muted-foreground text-sm">Click below to start an inquiry on WhatsApp.</p>

                        {/* Flex container to hold both buttons */}
                        <div className="flex gap-4 mt-4">
                          <a
                            href="https://wa.me/1234567890"  // Replace with your WhatsApp number
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white px-6 py-2 rounded-lg text-lg hover:bg-green-600 transition duration-300"
                          >
                            Start Chat
                          </a>

                          <Button
                            onClick={() => window.open('/path-to-product-pdf.pdf', '_blank')} // Adjust the path to your PDF file
                            className="flex items-center gap-2 bg-red-500 text-white py-6 px-6 rounded-lg hover:bg-red-600"
                          >
                            <File className="w-5 h-5" /> {/* Lucide File icon */}
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </div>
            </div>

                 {/* Reviews Section */}
          <Separator />
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((reviewItem) => (
                  <div key={reviewItem._id} className="flex gap-4">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>
                      <StarRatingComponent rating={reviewItem?.reviewValue} />
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No Reviews</p>
              )}
            </div>

            {/* Review Form */}
            {user && (
              <div className="mt-10 flex-col flex gap-2">
                <Label>Write a review</Label>
                <div className="flex gap-1">
                  <StarRatingComponent
                    rating={rating}
                    handleRatingChange={handleRatingChange}
                  />
                </div>
                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(event) => setReviewMsg(event.target.value)}
                  placeholder="Write a review..."
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === ""}
                >
                  Submit
                </Button>
              </div>
            )}
          </div>

           {/* Recently Viewed Products Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Dummy Products */}
              {[ 
                { id: "1", image: product1Image, title: "Product 1", price: "29.99" },
                { id: "2", image: product2Image, title: "Product 2", price: "49.99" },
                { id: "3", image: product3Image, title: "Product 3", price: "19.99" },
                { id: "4", image: product4Image, title: "Product 4", price: "39.99" },
              ].map((product) => (
                <div key={product.id} className="border p-4 rounded-lg shadow-lg">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-88 object-cover rounded-lg"
                  />
                  <h3 className="mt-2 text-xl font-semibold">{product.title}</h3>
                  <p className="mt-1 text-lg font-bold text-primary">${product.price}</p>
                  <Button className="mt-2 w-full">View Product</Button>
                </div>
              ))}
            </div>
          </section>
          
        </div>
      ) : (
        <p>Product not found.</p>
      )}
      <section>
       <GoogleReviewsSection/>
       </section>

      {/* <Navbar/> */}
       
      {/* Include Footer component here */}
      <Footer />
    </div>
  );
}

export default ProductDetailsPage;