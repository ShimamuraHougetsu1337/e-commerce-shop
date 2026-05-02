

export const APP_NAME = "E-Commerce";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const ROUTES = {
  HOME: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  PRODUCTS: "/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ACCOUNT: "/account",
} as const;

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  CART: "cart",
} as const;

export const ADMIN_ROLE = "SUPER_ADMIN";
export const USER_ROLE = "NORMAL_USER";