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
import ListingDetail from './outlet/ListingDetail.jsx'


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
import MerchantDashboard from './merchant/Dashboard.jsx';

import Profile from './account/Profile.jsx';
import MyOrders from './account/MyOrders.jsx';
import MyListings from './account/MyListings.jsx';
import ListingCreate from './account/ListingCreate.jsx';
import Messages from './account/Messages.jsx';

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
  ListingDetail,



  // User
  Profile,
  MyOrders,
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
  MerchantDashboard,
};
