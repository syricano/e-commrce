// client/src/pages/index.js
import HomePage from './HomePage.jsx';
import About from './About.jsx';
import NotFound from './NotFound.jsx';
import PartnerApply from './PartnerApply.jsx';

import Signin from './auth/Signin.jsx';
import Signup from './auth/Signup.jsx';

import Listings from './outlet/Listings.jsx'
import CategoryBrowse from './outlet/CategoryBrowse.jsx'
import Stores from './outlet/Stores.jsx'
import StoreDetail from './outlet/StoreDetail.jsx'
import ListingDetail from './outlet/ListingDetail.jsx'
import Collections from './outlet/Collections.jsx'
import ManageCollectionItems from './admin/ManageCollectionItems.jsx'
import DealsPage from './outlet/DealsPage.jsx'
import SearchResults from './outlet/SearchResults.jsx'


import Dashboard from './admin/Dashboard.jsx';
import ManageUsers from './admin/ManageUsers.jsx';
import ManageStores from './admin/ManageStores.jsx';
import ManageProducts from './admin/ManageProducts.jsx';
import ManageCategories from './admin/ManageCategories.jsx';
import ManageCollections from './admin/ManageCollections.jsx';
import ManageMedia from './admin/ManageMedia.jsx';
import ManageListings from './admin/ManageListings.jsx';
import ManageListingOffers from './admin/ManageListingOffers.jsx';
import ManageListingPromotions from './admin/ManageListingPromotions.jsx';
import ManageReports from './admin/ManageReports.jsx';
import ManagePartnerRequests from './admin/ManagePartnerRequests.jsx';
import ManageInvoices from './admin/ManageInvoices.jsx';
import ManageSellerSettings from './admin/ManageSellerSettings.jsx';
import ManageStoreSettings from './admin/ManageStoreSettings.jsx';
import ManageOrders from './admin/ManageOrders.jsx';
import MerchantDashboard from './merchant/Dashboard.jsx';
import StoreCategories from './merchant/StoreCategories.jsx';
import StoreProducts from './merchant/StoreProducts.jsx';
import StoreOffers from './merchant/StoreOffers.jsx';
import StoreShipping from './merchant/StoreShipping.jsx';
import StorePayment from './merchant/StorePayment.jsx';
import StorePickup from './merchant/StorePickup.jsx';
import StoreAssets from './merchant/StoreAssets.jsx';
import StoreInvoices from './merchant/StoreInvoices.jsx';
import StoreHelp from './merchant/StoreHelp.jsx';
import StoreOfferDetail from './offers/StoreOfferDetail'
import OfferDetail from './outlet/OfferDetail'

import Profile from './account/Profile.jsx';
import MyOrders from './account/MyOrders.jsx';
import OrderDetail from './account/OrderDetail.jsx';
import MyListings from './account/MyListings.jsx';
import ListingCreate from './account/ListingCreate.jsx';
import Messages from './account/Messages.jsx';

// Cart
import CartPage from './cart/CartPage.jsx';
import Checkout from './cart/Checkout.jsx';
import CheckoutSuccess from './cart/CheckoutSuccess.jsx';

export {
  // Public
  HomePage,
  About,
  NotFound,
  PartnerApply,
  Signin,
  Signup,
  
  Listings,
  CategoryBrowse,
  Stores,
  StoreDetail,
  ListingDetail,
  Collections,
  ManageCollectionItems ,
  DealsPage,
  SearchResults,



  // User
  Profile,
  MyOrders,
  OrderDetail,
  MyListings,
  ListingCreate,
  Messages,

  // Admin
  Dashboard,
  ManageUsers,
  ManageStores,
  ManageProducts,
  ManageCategories,
  ManageCollections,
  ManageMedia,
  ManageListings,
  ManageListingOffers,
  ManageListingPromotions,
  ManageReports,
  ManagePartnerRequests,
  ManageInvoices,
  ManageSellerSettings,
  ManageStoreSettings,
  ManageOrders,
  MerchantDashboard,
  StoreCategories,
  StoreProducts,
  StoreOffers,
  StoreShipping,
  StorePayment,
  StorePickup,
  StoreAssets,
  StoreInvoices,
  StoreHelp,
  StoreOfferDetail,
  OfferDetail,

  //cart
  CartPage,
  Checkout,
  CheckoutSuccess
};
