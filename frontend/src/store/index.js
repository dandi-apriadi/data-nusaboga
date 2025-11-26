import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./slices/authSlice";
import wishlistReducer from "./slices/wishlistSlice";
import bannerReducer from "./slices/bannerSlice";
import productsReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import blogReducer from "./slices/blogSlice";
import reviewReducer from "./slices/reviewSlice";
import chatbotReducer from "./slices/chatbotSlice";
import ordersReducer from "./slices/orderSlice";
import referralReducer from "./slices/referralSlice";
import posReducer from "./slices/posSlice";
import addressReducer from "./slices/addressSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    products: productsReducer,
    cart: cartReducer,
    blog: blogReducer,
    reviews: reviewReducer,
    chatbot: chatbotReducer,
    orders: ordersReducer,
    referral: referralReducer,
    pos: posReducer,
    addresses: addressReducer,
  profile: profileReducer,
  banners: bannerReducer,
  },
});
