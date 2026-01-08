export const constants = {
  isDevelopmentMode: process.env.NODE_ENV === "development",
  imageHost: process.env.NEXT_PUBLIC_API_URL,
  apis: {
    login: "/login",
  },
  route: {
    default: "/",
    login: "/login",
    blog: "/blog",
  },
};

export default constants;
