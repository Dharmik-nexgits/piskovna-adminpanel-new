export const constants = {
  isDevelopmentMode: process.env.NODE_ENV === "development",
  imageHost: process.env.NEXT_PUBLIC_API_URL,
  apis: {
    login: "/api/login",
    blog: "/api/blog",
  },
  route: {
    default: "/",
    login: "/login",
    blog: "/blog",
    cookiesbots: "/cookiesbots",
  },
};

export default constants;
