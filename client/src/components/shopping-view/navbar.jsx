import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineWhatsApp, AiOutlineSearch, AiOutlineShoppingCart, AiOutlineHeart, AiOutlineGlobal } from "react-icons/ai"; 
import { FiUser } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import { shoppingViewHeaderMenuItems } from "@/config";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import img from "../../assets/textile-logo.svg";
import { logoutUser } from "@/store/auth-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { setCurrency, selectCurrency, selectExchangeRates } from "@/store/shop/currency-slice";
import { getSearchResults, resetSearchResults } from "@/store/shop/search-slice";
import UserCartWrapper from "./cart-wrapper";

function ShoppingHeader() {
  const selectedCurrency = useSelector(selectCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { searchResults } = useSelector((state) => state.shopSearch);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle logout functionality
  function handleLogout() {
    dispatch(logoutUser());
    setAccountDropdownOpen(false);
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id)); // Fetch cart items when user is present
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      dispatch(getSearchResults(searchQuery)); 
      setShowSearchResults(true);
    } else {
      dispatch(resetSearchResults());
      setShowSearchResults(false);
    }
  }, [searchQuery, dispatch]);

  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    dispatch(setCurrency(newCurrency)); // Set new currency
  };

  const handleNavigate = (menuItem) => {
    navigate(menuItem.path);
    setAccountDropdownOpen(false);
  };

  const convertPrice = (price) => {
    const rate = exchangeRates[selectedCurrency] || 1;
    return price * rate;
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); 
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/search?query=${searchQuery}`);
    }
  };

  const handleSearchResultClick = (productId) => {
    if (!productId) {
      console.error("Invalid product ID");
      return; 
    }
    navigate(`/shop/product/${productId}`);
    setSearchQuery('');
    dispatch(resetSearchResults());
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex flex-col">
        <div className="flex justify-between items-center bg-gray-200 py-2 px-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-black-600 font-bold">
              <AiOutlineWhatsApp className="inline-block mr-2 text-green-600" size={24} />
              +91 1452896547 / +91 1452896547
            </span>
          </div>
          <span className="text-sm">
            <FaTrophy className="inline-block mr-1 text-yellow-500" size={16} />
            +10 Years of Excellence |
            <AiOutlineGlobal className="inline-block mr-1 ml-1 text-gray-600" size={16} />
            Worldwide Shipping
          </span>
          <div className="flex items-center gap-4">
            <span>Shipping Rate | COD Check | Help</span>
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="p-1 border rounded-md text-sm"
              >
                {Object.keys(exchangeRates).map((currencyCode) => (
                  <option key={currencyCode} value={currencyCode}>
                    {currencyCode}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 px-4 bg-white shadow-md">
          <Link to="/shop/home" className="flex items-center gap-2">
            <img src={img} alt="Logo" className="h-16" />
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-64">
            <input
              type="text"
              placeholder="Search by name, category, etc."
              value={searchQuery}
              onChange={handleSearchChange}
              className="border p-2 rounded-md w-full"
            />
            <AiOutlineSearch className="absolute top-2 right-2 text-gray-500 cursor-pointer" />
            
            {showSearchResults && searchResults?.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white border shadow-md rounded-md z-10">
                <ul className="max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <li
                      key={index}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSearchResultClick(result.id)}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={result.imageUrl || 'default-image.jpg'}
                          alt={result.name}
                          className="w-16 h-16 object-cover"
                        />
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-gray-500">{result.category}</div>
                          <div className="text-sm">{convertPrice(result.price)} {selectedCurrency}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>

          {/* Icons */}
          <div className="flex gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/shop/wishlist")}>
              <AiOutlineHeart className="w-6 h-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenCartSheet(true)}
              className="relative"
            >
              <AiOutlineShoppingCart className="w-6 h-6" />
              <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
                {cartItems?.items?.length || 0}
              </span>
            </Button>

            <DropdownMenu open={accountDropdownOpen} onOpenChange={setAccountDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FiUser className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => navigate("/shop/account")}>My Account</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cart Sheet */}
        <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
          <SheetTrigger />
          <SheetContent side="right">
            <UserCartWrapper
              setOpenCartSheet={setOpenCartSheet}
              cartItems={cartItems?.items || []}
            />
          </SheetContent>
        </Sheet>

        {/* Navbar Filters at the Bottom */}
        <div className="flex flex-wrap gap-6 bg-gray-100 py-3 px-4 text-sm">
          {shoppingViewHeaderMenuItems.map((menuItem) => (
            <div
              key={menuItem.id}
              onClick={() => handleNavigate(menuItem)}
              className="cursor-pointer hover:bg-gray-300 py-1 px-2"
            >
              {menuItem.label}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
