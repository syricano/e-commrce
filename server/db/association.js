// server/db/association.js
// B2C imports
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Address from '../models/Address.js';
import Store from '../models/Store.js';
import StoreUser from '../models/StoreUser.js';
import Category from '../models/Category.js';
import CategoryTranslation from '../models/CategoryTranslation.js';
import Brand from '../models/Brand.js';
import BrandTranslation from '../models/BrandTranslation.js';
import Product from '../models/Product.js';
import ProductTranslation from '../models/ProductTranslation.js';
import ProductVariant from '../models/ProductVariant.js';
import Media from '../models/Media.js';
import Offer from '../models/Offer.js';
import Inventory from '../models/Inventory.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Shipment from '../models/Shipment.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import ReturnRequest from '../models/ReturnRequest.js';
import Review from '../models/Review.js';
import CommissionScheme from '../models/CommissionScheme.js';
import Payout from '../models/Payout.js';
import Collection from '../models/Collection.js';
import CollectionTranslation from '../models/CollectionTranslation.js';
import CollectionRule from '../models/CollectionRule.js';
import Placement from '../models/Placement.js';
import ReviewVote from '../models/ReviewVote.js';
import AuditLog from '../models/AuditLog.js';
// C2C imports
import Listing from '../models/Listing.js';
import ListingTranslation from '../models/ListingTranslation.js';
import ListingMedia from '../models/ListingMedia.js';
import ListingOffer from '../models/ListingOffer.js';
import MessageThread from '../models/MessageThread.js';
import Message from '../models/Message.js';
import Favorite from '../models/Favorite.js';
import Report from '../models/Report.js';
// New
import C2CTransaction from '../models/C2CTransaction.js';
import UserRating from '../models/UserRating.js';
import ListingPromotion from '../models/ListingPromotion.js';
import SavedSearch from '../models/SavedSearch.js';
import Notification from '../models/Notification.js';
import BlockedUser from '../models/BlockedUser.js';

export function applyAssociations() {
  // ------- B2C -------
  User.hasOne(Profile, { foreignKey:'user_id', as:'profile' });
  Profile.belongsTo(User, { foreignKey:'user_id', as:'user' });

  User.hasMany(Address, { foreignKey:'user_id', as:'addresses', onDelete:'CASCADE' });
  Address.belongsTo(User, { foreignKey:'user_id', as:'user' });

  User.hasMany(Store, { foreignKey:'owner_user_id', as:'ownedStores' });
  Store.belongsTo(User, { foreignKey:'owner_user_id', as:'owner' });

  Store.hasMany(StoreUser, { foreignKey:'store_id', as:'members', onDelete:'CASCADE' });
  StoreUser.belongsTo(Store, { foreignKey:'store_id', as:'store' });
  User.hasMany(StoreUser, { foreignKey:'user_id', as:'storeMemberships', onDelete:'CASCADE' });
  StoreUser.belongsTo(User, { foreignKey:'user_id', as:'member' });

  CommissionScheme.hasMany(Store, { foreignKey:'commission_scheme_id', as:'stores' });
  Store.belongsTo(CommissionScheme, { foreignKey:'commission_scheme_id', as:'commissionScheme' });

  Category.hasMany(Category, { foreignKey:'parent_id', as:'children' });
  Category.belongsTo(Category, { foreignKey:'parent_id', as:'parent' });

  Category.hasMany(CategoryTranslation, { foreignKey:'category_id', as:'translations', onDelete:'CASCADE' });
  CategoryTranslation.belongsTo(Category, { foreignKey:'category_id', as:'category' });

  Brand.hasMany(BrandTranslation, { foreignKey:'brand_id', as:'translations', onDelete:'CASCADE' });
  BrandTranslation.belongsTo(Brand, { foreignKey:'brand_id', as:'brand' });

  Brand.hasMany(Product, { foreignKey:'brand_id', as:'products' });
  Product.belongsTo(Brand, { foreignKey:'brand_id', as:'brand' });

  Category.hasMany(Product, { foreignKey:'default_category_id', as:'products' });
  Product.belongsTo(Category, { foreignKey:'default_category_id', as:'defaultCategory' });

  Product.hasMany(ProductTranslation, { foreignKey:'product_id', as:'translations', onDelete:'CASCADE' });
  ProductTranslation.belongsTo(Product, { foreignKey:'product_id', as:'product' });

  Product.hasMany(ProductVariant, { foreignKey:'product_id', as:'variants', onDelete:'CASCADE' });
  ProductVariant.belongsTo(Product, { foreignKey:'product_id', as:'product' });

  Product.hasMany(Media, { foreignKey:'product_id', as:'media' });
  Media.belongsTo(Product, { foreignKey:'product_id', as:'product' });
  ProductVariant.hasMany(Media, { foreignKey:'variant_id', as:'media' });
  Media.belongsTo(ProductVariant, { foreignKey:'variant_id', as:'variant' });

  Store.hasMany(Offer, { foreignKey:'store_id', as:'offers', onDelete:'CASCADE' });
  Offer.belongsTo(Store, { foreignKey:'store_id', as:'store' });
  ProductVariant.hasMany(Offer, { foreignKey:'variant_id', as:'offers', onDelete:'CASCADE' });
  Offer.belongsTo(ProductVariant, { foreignKey:'variant_id', as:'variant' });

  Offer.hasOne(Inventory, { foreignKey:'offer_id', as:'inventory', onDelete:'CASCADE' });
  Inventory.belongsTo(Offer, { foreignKey:'offer_id', as:'offer' });

  User.hasMany(Cart, { foreignKey:'user_id', as:'carts' });
  Cart.belongsTo(User, { foreignKey:'user_id', as:'user' });

  Cart.hasMany(CartItem, { foreignKey:'cart_id', as:'items', onDelete:'CASCADE' });
  CartItem.belongsTo(Cart, { foreignKey:'cart_id', as:'cart' });
  Offer.hasMany(CartItem, { foreignKey:'offer_id', as:'cartItems', onDelete:'CASCADE' });
  CartItem.belongsTo(Offer, { foreignKey:'offer_id', as:'offer' });

  User.hasMany(Order, { foreignKey:'user_id', as:'orders' });
  Order.belongsTo(User, { foreignKey:'user_id', as:'user' });

  Order.hasMany(OrderItem, { foreignKey:'order_id', as:'items', onDelete:'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey:'order_id', as:'order' });
  Offer.hasMany(OrderItem, { foreignKey:'offer_id', as:'orderItems' });
  OrderItem.belongsTo(Offer, { foreignKey:'offer_id', as:'offer' });
  Store.hasMany(OrderItem, { foreignKey:'store_id', as:'orderItems' });
  OrderItem.belongsTo(Store, { foreignKey:'store_id', as:'store' });

  Order.hasMany(Shipment, { foreignKey:'order_id', as:'shipments' });
  Shipment.belongsTo(Order, { foreignKey:'order_id', as:'order' });
  Store.hasMany(Shipment, { foreignKey:'store_id', as:'shipments' });
  Shipment.belongsTo(Store, { foreignKey:'store_id', as:'store' });

  Order.hasMany(Payment, { foreignKey:'order_id', as:'payments' });
  Payment.belongsTo(Order, { foreignKey:'order_id', as:'order' });

  Order.hasMany(Refund, { foreignKey:'order_id', as:'refunds' });
  Refund.belongsTo(Order, { foreignKey:'order_id', as:'order' });
  Payment.hasMany(Refund, { foreignKey:'payment_id', as:'refunds' });
  Refund.belongsTo(Payment, { foreignKey:'payment_id', as:'payment' });

  Order.hasMany(ReturnRequest, { foreignKey:'order_id', as:'returnRequests' });
  ReturnRequest.belongsTo(Order, { foreignKey:'order_id', as:'order' });
  OrderItem.hasMany(ReturnRequest, { foreignKey:'order_item_id', as:'returnRequests' });
  ReturnRequest.belongsTo(OrderItem, { foreignKey:'order_item_id', as:'orderItem' });

  User.hasMany(Review, { foreignKey:'user_id', as:'reviews' });
  Review.belongsTo(User, { foreignKey:'user_id', as:'author' });
  Product.hasMany(Review, { foreignKey:'product_id', as:'reviews' });
  Review.belongsTo(Product, { foreignKey:'product_id', as:'product' });
  Store.hasMany(Review, { foreignKey:'store_id', as:'reviews' });
  Review.belongsTo(Store, { foreignKey:'store_id', as:'store' });

  Review.hasMany(ReviewVote, { foreignKey:'review_id', as:'votes', onDelete:'CASCADE' });
  ReviewVote.belongsTo(Review, { foreignKey:'review_id', as:'review' });
  User.hasMany(ReviewVote, { foreignKey:'user_id', as:'reviewVotes', onDelete:'CASCADE' });
  ReviewVote.belongsTo(User, { foreignKey:'user_id', as:'voter' });

  Store.hasMany(Payout, { foreignKey:'store_id', as:'payouts' });
  Payout.belongsTo(Store, { foreignKey:'store_id', as:'store' });

  Collection.hasMany(CollectionTranslation, { foreignKey:'collection_id', as:'translations', onDelete:'CASCADE' });
  CollectionTranslation.belongsTo(Collection, { foreignKey:'collection_id', as:'collection' });
  Collection.hasMany(CollectionRule, { foreignKey:'collection_id', as:'rules', onDelete:'CASCADE' });
  CollectionRule.belongsTo(Collection, { foreignKey:'collection_id', as:'collection' });
  Collection.hasMany(Placement, { foreignKey:'collection_id', as:'placements', onDelete:'CASCADE' });
  Placement.belongsTo(Collection, { foreignKey:'collection_id', as:'collection' });

  User.hasMany(AuditLog, { foreignKey:'actor_user_id', as:'auditLogs' });
  AuditLog.belongsTo(User, { foreignKey:'actor_user_id', as:'actor' });

  // ------- C2C -------
  User.hasMany(Listing, { foreignKey:'owner_user_id', as:'listings' });
  Listing.belongsTo(User, { foreignKey:'owner_user_id', as:'owner' });
  Category.hasMany(Listing, { foreignKey:'category_id', as:'listings' });
  Listing.belongsTo(Category, { foreignKey:'category_id', as:'category' });

  Listing.hasMany(ListingTranslation, { foreignKey:'listing_id', as:'translations', onDelete:'CASCADE' });
  ListingTranslation.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });
  Listing.hasMany(ListingMedia, { foreignKey:'listing_id', as:'media', onDelete:'CASCADE' });
  ListingMedia.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });

  Listing.hasMany(ListingOffer, { foreignKey:'listing_id', as:'offers', onDelete:'CASCADE' });
  ListingOffer.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });
  User.hasMany(ListingOffer, { foreignKey:'buyer_user_id', as:'listingOffers' });
  ListingOffer.belongsTo(User, { foreignKey:'buyer_user_id', as:'buyer' });

  Listing.hasMany(MessageThread, { foreignKey:'listing_id', as:'threads', onDelete:'CASCADE' });
  MessageThread.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });
  User.hasMany(MessageThread, { foreignKey:'buyer_user_id', as:'buyingThreads' });
  User.hasMany(MessageThread, { foreignKey:'seller_user_id', as:'sellingThreads' });
  MessageThread.belongsTo(User, { foreignKey:'buyer_user_id', as:'buyer' });
  MessageThread.belongsTo(User, { foreignKey:'seller_user_id', as:'seller' });

  MessageThread.hasMany(Message, { foreignKey:'thread_id', as:'messages', onDelete:'CASCADE' });
  Message.belongsTo(MessageThread, { foreignKey:'thread_id', as:'thread' });
  User.hasMany(Message, { foreignKey:'sender_user_id', as:'sentMessages' });
  Message.belongsTo(User, { foreignKey:'sender_user_id', as:'sender' });

  User.hasMany(Favorite, { foreignKey:'user_id', as:'favorites' });
  Favorite.belongsTo(User, { foreignKey:'user_id', as:'user' });
  Listing.hasMany(Favorite, { foreignKey:'listing_id', as:'favorites' });
  Favorite.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });

  Listing.hasMany(Report, { foreignKey:'listing_id', as:'reports' });
  Report.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });
  User.hasMany(Report, { foreignKey:'reporter_user_id', as:'reportsFiled' });
  Report.belongsTo(User, { foreignKey:'reporter_user_id', as:'reporter' });

  // ------- NEW -------
  // Transactions
  Listing.hasMany(C2CTransaction, { foreignKey:'listing_id', as:'transactions' });
  C2CTransaction.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });
  User.hasMany(C2CTransaction, { foreignKey:'buyer_user_id', as:'buyTransactions' });
  C2CTransaction.belongsTo(User, { foreignKey:'buyer_user_id', as:'buyer' });
  User.hasMany(C2CTransaction, { foreignKey:'seller_user_id', as:'sellTransactions' });
  C2CTransaction.belongsTo(User, { foreignKey:'seller_user_id', as:'seller' });

  // Ratings
  User.hasMany(UserRating, { foreignKey:'rater_user_id', as:'givenRatings' });
  UserRating.belongsTo(User, { foreignKey:'rater_user_id', as:'rater' });
  User.hasMany(UserRating, { foreignKey:'ratee_user_id', as:'receivedRatings' });
  UserRating.belongsTo(User, { foreignKey:'ratee_user_id', as:'ratee' });
  C2CTransaction.hasMany(UserRating, { foreignKey:'transaction_id', as:'ratings' });
  UserRating.belongsTo(C2CTransaction, { foreignKey:'transaction_id', as:'transaction' });

  // Promotions
  Listing.hasMany(ListingPromotion, { foreignKey:'listing_id', as:'promotions', onDelete:'CASCADE' });
  ListingPromotion.belongsTo(Listing, { foreignKey:'listing_id', as:'listing' });

  // Saved searches
  User.hasMany(SavedSearch, { foreignKey:'user_id', as:'savedSearches', onDelete:'CASCADE' });
  SavedSearch.belongsTo(User, { foreignKey:'user_id', as:'user' });

  // Notifications
  User.hasMany(Notification, { foreignKey:'user_id', as:'notifications', onDelete:'CASCADE' });
  Notification.belongsTo(User, { foreignKey:'user_id', as:'user' });

  // Blocks
  User.hasMany(BlockedUser, { foreignKey:'user_id', as:'blocks', onDelete:'CASCADE' });
  BlockedUser.belongsTo(User, { foreignKey:'user_id', as:'user' });
  User.hasMany(BlockedUser, { foreignKey:'blocked_user_id', as:'blockedBy', onDelete:'CASCADE' });
  BlockedUser.belongsTo(User, { foreignKey:'blocked_user_id', as:'blocked' });

  return {
    User, Profile, Address, Store, StoreUser, Category, CategoryTranslation, Brand, BrandTranslation,
    Product, ProductTranslation, ProductVariant, Media, Offer, Inventory, Cart, CartItem, Order, OrderItem,
    Shipment, Payment, Refund, ReturnRequest, Review, CommissionScheme, Payout, Collection, CollectionTranslation,
    CollectionRule, Placement, ReviewVote, AuditLog,
    Listing, ListingTranslation, ListingMedia, ListingOffer, MessageThread, Message, Favorite, Report,
    C2CTransaction, UserRating, ListingPromotion, SavedSearch, Notification, BlockedUser
  };
}

export default applyAssociations;
