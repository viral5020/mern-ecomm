import { Route, Routes, useLocation , useNavigate} from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./pages/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdmingiftCard from "./pages/admin-view/giftCard";
import AdminCustomer from './pages/admin-view/customer';
import AdminSales from './pages/admin-view/sales';
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import SearchProducts from "./pages/shopping-view/search";

import ForgotPassword from './pages/auth/forgetpassword';

import ResetPassword from "./pages/auth/resetpassword";

import ProductDetailsPage from "./pages/shopping-view/ProductDetailsPage";

import Category from "./pages/admin-view/category"; 

import SettingsPage from "./pages/admin-view/setting"; 

import InvoiceGeneratorPage from './pages/admin-view/InvoiceGeneratorPage';

import AllInvoicesPage from './pages/admin-view/allinvoice';

import InventoryPage from "./pages/admin-view/InventoryPage";

import WishlistPage from './pages/shopping-view/wishlist';

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
 
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  console.log(isLoading, user);

  
  

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        />
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="giftCard" element={<AdmingiftCard />} />
          <Route path="customer" element={<AdminCustomer />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="category" element={<Category />} /> 
          <Route path="/admin/invoice" element={<InvoiceGeneratorPage />} />
          <Route path="/admin/allinvoice" element={<AllInvoicesPage />} />
          <Route path="/admin/Inventory" element={<InventoryPage />} />
        </Route>
        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="wishlist" element={<WishlistPage />} />
          
        </Route>
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Routes>
          <Route path="/auth/forgotpassword" element={<ForgotPassword />} />
          <Route path="/auth/resetpassword/" element={<ResetPassword />} />
          
        </Routes>

        
        <Routes>
        <Route path="/" element={<ShoppingHome />} />
        <Route path="/product-details/:productId" element={<ProductDetailsPage />} />
      </Routes>

      
        
      
    </div>
  );
}

export default App;
