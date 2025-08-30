// client/src/App.jsx
import { Routes, Route } from 'react-router-dom'
import {
  // Public
  HomePage, About, NotFound, Signin, Signup, Listings, ListingDetail, CategoryBrowse, Stores, StoreDetail, PartnerApply, Collections,
  SearchResults,
  // User
  Profile, MyOrders, MyListings, ListingCreate, Messages,
  OrderDetail,
  // Admin
  Dashboard,
  ManageUsers, ManageStores, ManageProducts, ManageCategories,
  ManageCollections, ManageMedia, ManageListings, ManageListingOffers,
  ManageListingPromotions, ManageReports, ManagePartnerRequests, ManageInvoices,
  MerchantDashboard,
  StoreCategories, StoreProducts, StoreOffers,
  StoreShipping, StorePayment, StoreAssets, StoreInvoices, StoreHelp,
} from '@/pages'
import { ProtectedLayout, RootLayout, AccountLayout ,AdminLayout } from '@/layouts'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="about" element={<About />} />
        <Route path="partner" element={<PartnerApply />} />
        <Route path="listings" element={<Listings />} />
        <Route path="listings/:id" element={<ListingDetail />} />
        <Route path="c/:slug" element={<CategoryBrowse />} />
        <Route path="stores" element={<Stores />} />
        <Route path="stores/:id" element={<StoreDetail />} />
        <Route path="collections" element={<Collections />} />
        <Route path="search" element={<SearchResults />} />

        {/* Auth */}
        <Route path="signin" element={<Signin />} />
        <Route path="signup" element={<Signup />} />

        {/* Protected */}
        <Route element={<ProtectedLayout />}>
          <Route path="account/profile" element={<Profile />} />
        </Route>

        {/* Merchant (seller/staff/admin only) */}
        <Route element={<ProtectedLayout roles={["seller","staff","admin"]} />}>
          <Route path="merchant" element={<MerchantDashboard />} />
          <Route path="merchant/store/:id/categories" element={<StoreCategories />} />
          <Route path="merchant/store/:id/products" element={<StoreProducts />} />
          <Route path="merchant/store/:id/offers" element={<StoreOffers />} />
          <Route path="merchant/store/:id/shipping" element={<StoreShipping />} />
          <Route path="merchant/store/:id/pickup" element={<StoreShipping />} />
          <Route path="merchant/store/:id/payment" element={<StorePayment />} />
          <Route path="merchant/store/:id/invoices" element={<StoreInvoices />} />
          <Route path="merchant/store/:id/assets" element={<StoreAssets />} />
          <Route path="merchant/store/:id/help" element={<StoreHelp />} />
        </Route>

        {/* Account area (all signed-in users) */}
        <Route element={<ProtectedLayout />}>
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<MyOrders />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="listings/new" element={<ListingCreate />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route>

        {/* Admin (UI protected to staff/admin) */}
        <Route element={<ProtectedLayout roles={["staff","admin"]} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="stores" element={<ManageStores />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="collections" element={<ManageCollections />} />
            <Route path="media" element={<ManageMedia />} />
            <Route path="listings" element={<ManageListings />} />
            <Route path="listing-offers" element={<ManageListingOffers />} />
            <Route path="listing-promotions" element={<ManageListingPromotions />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="partner-requests" element={<ManagePartnerRequests />} />
          <Route path="invoices" element={<ManageInvoices />} />
        </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
