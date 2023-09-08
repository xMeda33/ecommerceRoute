import { cartModel } from "../../../DB/models/cart.model.js";
import { productModel } from "../../../DB/models/product.model.js";

//clear cart

export const clearCart = async (user) => {
  await cartModel.findOneAndUpdate({ user: user }, { products: [] });
};

//update stock

export const updateStock = async (products, placeOrder) => {
  if(placeOrder){
  for (const product of products) {
    await productModel.findByIdAndUpdate(
      product.productId,
      {
        $inc: {
          availableItems: -product.quantity,
          soldItems: product.quantity,
        },
      },
      { new: true }
    );
  }
}else{
  for (const product of products) {
    await productModel.findByIdAndUpdate(
      product.productId,
      {
        $inc: {
          availableItems: product.quantity,
          soldItems: -product.quantity,
        },
      },
      { new: true }
    );
  }
}
};
