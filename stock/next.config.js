const withPWA = require("next-pwa");

/** @type {import('next').NextConfig} */
const nextConfig = {
  baseUrl: "src",
  reactStrictMode: false,
  trailingSlash: true,
  images: {
    loader: 'imgix',
    path: 'https://stock-dev.qafilaty.com',
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development"
  }
}

module.exports = withPWA(nextConfig);
