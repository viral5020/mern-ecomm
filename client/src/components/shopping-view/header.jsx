import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import img from "../../assets/textile-logo.svg";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { setCurrency, selectCurrency, selectExchangeRates } from "@/store/shop/currency-slice";  // Import from the slice

function ShoppingHeader() {
  const selectedCurrency = useSelector(selectCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    dispatch(fetchCartItems(user?.id));
  }, [dispatch]);

  // Handle currency change
  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    console.log(newCurrency,"newCurrency");
    dispatch(setCurrency(newCurrency));
  };

  // Handle navigation for menu items
  function handleNavigate(getCurrentMenuItem) {
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    // Do the logic based on menu item click (you can adjust this part)
    navigate(getCurrentMenuItem.path);
  }

  // Convert item price to selected currency using the rates from Redux
  const convertPrice = (price) => {
    const rate = exchangeRates[selectedCurrency] || 1; // Default to 1 if no rate found
    return price * rate;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2">
          
          
        <img src={img} alt="Logo" width="150" height="150" />

             
        </Link>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            {/* Mobile Menu */}
            <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
              {shoppingViewHeaderMenuItems.map((menuItem) => (
                <Label
                  onClick={() => handleNavigate(menuItem)}
                  className="text-sm font-medium cursor-pointer"
                  key={menuItem.id}
                >
                  {menuItem.label}
                </Label>
              ))}
            </nav>
            {/* Right Content Section in Mobile */}
            <div className="flex flex-col items-start gap-4">
              <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
                <Button
                  onClick={() => setOpenCartSheet(true)}
                  variant="outline"
                  size="icon"
                  className="relative"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
                    {cartItems?.items?.length || 0}
                  </span>
                  <span className="sr-only">User cart</span>
                </Button>
                <UserCartWrapper
                  setOpenCartSheet={setOpenCartSheet}
                  cartItems={cartItems?.items || []}
                />
              </Sheet>

              {/* Currency Selector */}
              <div className="flex items-center gap-2">
                
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

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="bg-black">
                    <AvatarFallback className="bg-black text-white font-extrabold">
                      {user?.userName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="w-56">
                  <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/shop/account")}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Menu Items */}
        <div className="hidden lg:block">
          <nav className="flex lg:items-center gap-6">
            {shoppingViewHeaderMenuItems.map((menuItem) => (
              <Label
                onClick={() => handleNavigate(menuItem)}
                className="text-sm font-medium cursor-pointer"
                key={menuItem.id}
              >
                {menuItem.label}
              </Label>
            ))}
          </nav>
        </div>

        {/* Right Content in Desktop */}
        <div className="flex lg:items-center lg:flex-row flex-col gap-4">
          <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
            <Button
              onClick={() => setOpenCartSheet(true)}
              variant="outline"
              size="icon"
              className="relative"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
                {cartItems?.items?.length || 0}
              </span>
              <span className="sr-only">User cart</span>
            </Button>
            <UserCartWrapper
              setOpenCartSheet={setOpenCartSheet}
              cartItems={cartItems?.items || []}
            />
          </Sheet>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
           
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

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="bg-black">
                <AvatarFallback className="bg-black text-white font-extrabold">
                  {user?.userName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="w-56">
              <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/shop/account")}>
                <UserCog className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
