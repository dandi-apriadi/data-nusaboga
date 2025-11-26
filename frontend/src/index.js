import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from "./App";

// Set CSS variable --vh to address iOS 100vh issues
const setViewportHeightVar = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Initialize and listen for resize/orientation changes
setViewportHeightVar();
window.addEventListener('resize', setViewportHeightVar);
window.addEventListener('orientationchange', setViewportHeightVar);

// Build a router with future flag for v7 relative splat path
const router = createBrowserRouter([
  { path: "/*", element: <App /> },
], {
  future: {
    v7_relativeSplatPath: true,
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

// Optional: cleanup on hot reload in dev
if (typeof import.meta !== 'undefined' && import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('resize', setViewportHeightVar);
    window.removeEventListener('orientationchange', setViewportHeightVar);
  });
}
