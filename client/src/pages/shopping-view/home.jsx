import { Button } from "@/components/ui/button";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
  CheckCircle,
  Headphones,
  Shield,
  CreditCard
} from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/pages/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import Footer from "@/components/shopping-view/footer";
import img from "../../assets/goog.png";
import { Helmet } from 'react-helmet';
import ReactChatbot from "react-chatbotify";
import config from "@/components/shopping-view/chatbotConfig";
import ActionProvider from "@/components/shopping-view/ActionProvider"; // Import the ActionProvider
import MessageParser from "@/components/shopping-view/MessageParser";


// Category and Brand icons
const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Banner Carousel States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannersToShow, setBannersToShow] = useState(3); // Default to show 3 banners on large screens
  const spaceBetweenBanners = 1;
  const bannerWidth = 22.5; // Reduced width for each banner

  const totalBanners = featureImageList.length;
  const totalGroups = Math.ceil(totalBanners / bannersToShow); // Calculate the number of groups for scrolling

  const totalWidth = featureImageList.length * (bannerWidth + spaceBetweenBanners); // Total width based on images

  

  // Update the number of banners to show based on the screen size
  useEffect(() => {
    const updateBannersToShow = () => {
      if (window.innerWidth >= 1024) {
        setBannersToShow(3); // Large screens (desktop)
      } else if (window.innerWidth >= 768) {
        setBannersToShow(2); // Medium screens (tablet)
      } else {
        setBannersToShow(1); // Small screens (mobile)
      }
    };

    updateBannersToShow(); // Initialize based on current screen size

    window.addEventListener("resize", updateBannersToShow); // Update on window resize

    return () => {
      window.removeEventListener("resize", updateBannersToShow); // Cleanup event listener on unmount
    };
  }, []);

  // Scroll functions for left and right
  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    } else {
      setCurrentIndex(totalBanners - 1); // Reset to the last image when at the beginning
    }
  };

  const scrollRight = () => {
    if (currentIndex < totalBanners - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else {
      setCurrentIndex(0); // Reset to the first image when at the end
    }
  };

  // Functions to handle navigation and actions
  const handleNavigateToListingPage = (getCurrentItem, section) => {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/shop/listing");
  };

  const handleGetProductDetails = (getCurrentProductId) => {
    // Navigate to the ProductDetailsPage with the product ID
    navigate(`/product-details/${getCurrentProductId}`);
  };

  const handleAddtoCart = (getCurrentProductId) => {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  };

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  const carouselRef = useRef(null);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productList.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const generatePageNumbers = () => {
    const totalPages = Math.ceil(productList.length / productsPerPage);
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...');
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col min-h-screen space-y-16">
      {/* Feature Product Carousel */}
      <div className="relative w-full h-[300px] overflow-hidden mb-0">
        <div
          ref={carouselRef}
          className="flex transition-all duration-1000"
          style={{
            transform: `translateX(-${currentIndex * (bannerWidth + spaceBetweenBanners)}%)`, // Scroll by 1 group
            width: `${totalWidth}%`, // Total width based on images
          }}
        >
          {featureImageList && featureImageList.length > 0
            ? featureImageList.map((slide, index) => (
              <div
                key={index}
                className="flex-shrink-0"
                style={{
                  width: `${bannerWidth}%`, // Adjust width based on the number of banners to show
                  marginRight: `${spaceBetweenBanners}%`, // Add space between the banners
                }}
              >
                <img
                  src={slide?.image}
                  alt={`feature-banner-${index}`}
                  className="w-full h-full object-cover rounded-lg" // Ensures images fill the container and maintain aspect ratio
                />
              </div>
            ))
            : null}
        </div>

        {/* Left and Right Scroll Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={scrollLeft}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 p-3"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollRight}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 p-3"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
      </div>

      {/* Feature Products Heading */}
      <section className="flex items-center">
        <div>
          <Helmet>
            <link href="https://fonts.googleapis.com/css2?family=Bungee+Shade&display=swap" rel="stylesheet" />
          </Helmet>
          <h2 className="text-4xl font-bold text-left mb-4 mr-8 ml-3" style={{ fontFamily: 'Bungee Shade, sans-serif' }}>
            Featured Products
          </h2>
        </div>

        {/* Buttons Container */}
        {/* <div className="ml-43 space-x-4 flex items-center">
   
    <button className="px-6 py-2 mb-0 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none">
      Coming Soon
    </button>

    
    <button className="px-6 py-2 mb-0 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none">
      Premium Collection
    </button>

    
    <button className="px-6 py-2 mb-0 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none">
      Sale
    </button>

    
    <button className="px-6 py-2 mb-0 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none">
      Same Day Ship
    </button>

    
    <a href="http://localhost:5173/shop/listing" target="_blank" rel="noopener noreferrer">
      <button className="px-6 py-2 mb-0 bg-black text-white rounded-full hover:bg-gray-800 focus:outline-none">
        View All Products
      </button>
    </a>
  </div> */}
        <div className="ml-43 space-x-4 flex items-center">
          {/* Button for Coming Soon */}
          <button className="px-8 py-3 mb-0 border-2 border-black text-black text-lg rounded-full hover:bg-gray-100 focus:outline-none">
            Coming Soon
          </button>

          {/* Button for Premium Collection */}
          <button className="px-8 py-3 mb-0 border-2 border-black text-black text-lg rounded-full hover:bg-gray-100 focus:outline-none">
            Premium Collection
          </button>

          {/* Button for Sale */}
          <button className="px-8 py-3 mb-0 border-2 border-black text-black text-lg rounded-full hover:bg-gray-100 focus:outline-none">
            Sale
          </button>

          {/* Button for Same Day Ship */}
          <button className="px-8 py-3 mb-0 border-2 border-black text-black text-lg rounded-full hover:bg-gray-100 focus:outline-none">
            Same Day Ship
          </button>

          {/* Button for View All Products */}
          <a href="http://localhost:5173/shop/listing" target="_blank" rel="noopener noreferrer">
            <button className="px-8 py-3 mb-0 border-2 border-black text-black text-lg rounded-full hover:bg-gray-100 focus:outline-none">
              View All Products
            </button>
          </a>
        </div>
      </section>




      {/* Feature Products Section */}
      <section className="pt-0 mt-0 w-full">
        <div className="px-4  w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {currentProducts && currentProducts.length > 0
              ? currentProducts.map((productItem) => (
                <div key={productItem.id} className="flex-shrink-0">
                  <ShoppingProductTile
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                </div>
              ))
              : null}
          </div>
        </div>
      </section>




      {/* Pagination Section */}
      <section className="py-0 pt-0 text-center">
        <div className="button-container flex justify-center items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => paginate(1)}
            className="px-3 py-2"
          >
            First
          </Button>
          {generatePageNumbers().map((item, index) => (
            item === '...' ? (
              <span key={index} className="px-3 py-2">...</span>
            ) : (
              <Button
                key={index}
                variant="outline"
                onClick={() => paginate(item)}
                className={`px-3 py-2 ${currentPage === item ? 'bg-black text-white' : ''} mx-2`}
              >
                {item}
              </Button>
            )
          ))}
          <Button
            variant="outline"
            onClick={() => paginate(Math.ceil(productList.length / productsPerPage))}
            className="px-3 py-2"
          >
            Last
          </Button>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <img
            src={img} // Assuming the image is imported or from a URL
            alt="Google logo"
            className="w-24 h-24 mx-auto" // Centers the image horizontally
          />
          <h2 className="text-4xl font-bold mt-4 mb-4">Google Reviews</h2>

          <div className="space-y-8">
            {/* Review 1 */}
            <div className="flex flex-col bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center mb-4"> {/* Flex-col to stack items vertically */}
                {/* Rating Stars */}
                <div className="flex text-yellow-500">
                  <span>⭐⭐⭐⭐⭐</span>
                </div>
                <p className="mt-2 font-bold text-lg">Sam Wilson</p> {/* Added mt-2 for spacing between stars and name */}
              </div>
              <p className="text-gray-700">
                "This place exceeded my expectations. The quality of the products and customer service is outstanding. I will definitely recommend it to my friends!"
              </p>
            </div>

            {/* New Section: 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {/* Card 1 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4 text-green-500">
                  <CheckCircle /> {/* Lucide CheckCircle Icon */}
                </div>
                <h3 className="text-xl font-semibold mb-4">100% Quality</h3>
                <p className="text-gray-600">We guarantee the best quality in all our products.</p>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4 text-blue-500">
                  <Headphones /> {/* Lucide Headphones Icon */}
                </div>
                <h3 className="text-xl font-semibold mb-4">Easy Customer</h3>
                <p className="text-gray-600">Our customer service is fast and efficient for you.</p>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4 text-green-500">
                  <Shield /> {/* Lucide Shield Icon */}
                </div>
                <h3 className="text-xl font-semibold mb-4">Secure & Safe</h3>
                <p className="text-gray-600">Your personal information is always protected with us.</p>
              </div>

              {/* Card 4 */}
              <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-4 text-purple-500">
                  <CreditCard /> {/* Lucide CreditCard Icon */}
                </div>
                <h3 className="text-xl font-semibold mb-4">Multiple Payment</h3>
                <p className="text-gray-600">We offer various payment methods for your convenience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
     
      {/* Footer */}
       {/* Chatbot */}
       <ReactChatbot
        config={config}
        actionProvider={ActionProvider}
        messageParser={MessageParser}
      />
      
      <Footer />
    </div>
  );
}

export default ShoppingHome;
