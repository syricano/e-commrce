// client/src/App.jsx
import { Routes, Route } from 'react-router-dom'
import {
  // Public
  HomePage, About, NotFound, Signin, Signup, Listings,
  // User
  Profile, MyOrders, MyListings, ListingCreate,
  // Admin
  Dashboard,
  ManageUsers, ManageStores, ManageProducts, ManageCategories,
  ManageCollections, ManageMedia, ManageListings, ManageListingOffers,
  ManageListingPromotions, ManageReports,
} from '@/pages'
import { ProtectedLayout, RootLayout, AccountLayout ,AdminLayout } from '@/layouts'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="about" element={<About />} />
        <Route path="listings" element={<Listings />} />

        {/* Auth */}
        <Route path="signin" element={<Signin />} />
        <Route path="signup" element={<Signup />} />

        {/* Protected */}
        <Route element={<ProtectedLayout />}>
          <Route path="account/profile" element={<Profile />} />

          {/* Account area */}
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<MyOrders />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="listings/new" element={<ListingCreate />} />
          </Route>

        </Route>

        {/* Admin */}
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
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
