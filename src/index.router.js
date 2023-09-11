import authRouter from "./modules/user/user.router.js";
import categoryRouter from "./modules/category/category.router.js";
import subCategoryRouter from "./modules/subcategory/subcategory.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import productRouter from "./modules/product/product.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import morgan from "morgan";
import cors from "cors";

export const bootstrap = (app, express) => {
  if (process.env.NODE_ENV === "dev") {
    app.use(morgan("dev"));
  }
  //CORS

  // const whiteList = ["http://127.0.0.1:5500"];
  // app.use((req, res, next) => {
  //   //Activate Account
  //   if(req.originalUrl.includes("/auth/confirmEmail")){
  //     res.setHeader("Access-Control-Allow-Origin", "*");
  //     res.setHeader("Access-Control-Allow-Methods", "GET");
  //     return next()
  //   }
  //   if (!whiteList.includes(req.header("origin"))) {
  //     return next(new Error("Blocked By CORS!"));
  //   }
  //   res.setHeader("Access-Control-Allow-Origin", "*");
  //   res.setHeader("Access-Control-Allow-Headers", "*");
  //   res.setHeader("Access-Control-Allow-Methods", "*");
  //   res.setHeader("Access-Control-Allow-Private-Networks", true);
  //   return next();
  // });
  app.use(cors());

  //END CORS

  app.use((req, res, next) => {
    if (req.originalUrl === "/order/webhook") {
      return next;
    }
    express.json()(req, res, next);
  });
  app.use("/auth", authRouter);
  app.use("/category", categoryRouter);
  app.use("/subcategory", subCategoryRouter);
  app.use("/brand", brandRouter);
  app.use("/product", productRouter);
  app.use("/coupon", couponRouter);
  app.use("/cart", cartRouter);
  app.use("/order", orderRouter);
  app.all("*", (req, res, next) => {
    return next(new Error("Page not found", { cause: 404 }));
  });
  app.use((error, req, res, next) => {
    return res
      .status(error.cause || 500)
      .json({ success: false, message: error.message, stack: error.stack });
  });
};
