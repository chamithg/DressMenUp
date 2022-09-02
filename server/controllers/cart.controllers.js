const Cart = require("../models/cart.models");

//! ALL CARTS
module.exports.findAllItems = (req, res) => {
  Cart.find()
    .sort({ type: 1 })
    .then((allItems) => {
      res.json({ results: allItems });
    })
    .catch((err) => {
      res.json(err);
    });
};

//! ADD ITEMS TO CART
module.exports.CreateNewItem = (req, res) => {
  //!first it tries to find if this user already have a cart

  Cart.findOne({ user: req.body.user }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      //! if there is a cart, then check if the adding item is already in the cart
      let cartItem;

      for (let i = 0; i < cart.cartItems.length; i++) {
        if (cart.cartItems[i].item == req.body.item._id) {
          cartItem = cart.cartItems[i];
        }
      }
      //! if the item is available in cart, then change the quantity and price only
      if (cartItem) {
        const tempArr = [...cart.cartItems];
        for (var i = 0; i < tempArr.length; i++) {
          if (tempArr[i].id == cartItem.id) {
            tempArr.splice(i, 1);
            break;
          }
        }

        updatedItem = cartItem;
        updatedItem.quantity = cartItem.quantity + req.body.quantity;
        updatedItem.price =
          cartItem.price + req.body.item.price * req.body.quantity;
        tempArr.push(updatedItem);
        Cart.findOneAndUpdate(
          { _id: cart._id, "cartItem.id": req.body.item._id },
          {
            $set: {
              cartItems: [...tempArr],
            },
          }
        )

          .then((updatedItem) => {
            res.json({ results: updatedItem });
          })
          .catch((err) => {
            res.json(err);
          });

        //! if the item not availabe in cart, create new item and push it to user items array
      } else {
        const newCartItem = {
          item: req.body.item._id,
          cartObj: req.body.cartObj,
          price: req.body.item.price * req.body.quantity,
          quantity: req.body.quantity,
        };
        Cart.findByIdAndUpdate(
          { _id: cart._id },
          {
            $push: {
              cartItems: newCartItem,
            },
          }
        )
          .then((updatedItem) => {
            res.json({ results: updatedItem });
          })
          .catch((err) => {
            res.json(err);
          });
      }
    } else {
      //! if req.user doesnt have a cart, it will create a cart
      const newCart = {
        user: req.body.user,
        cartItems: {
          item: req.body.item._id,
          price: req.body.item.price * req.body.quantity,
          cartObj: req.body.cartObj,
          quantity: req.body.quantity,
        },
      };
      Cart.create(newCart)
        .then((newItem) => {
          res.json({ results: newItem });
        })
        .catch((err) => {
          res.json(err);
        });
    }
  });
};

//! RETRIEVE ITEMS IN THE CURRENT USER CART
module.exports.findOneItem = (req, res) => {
  Cart.findOne({ user: req.params.userId })
    .then((foundItem) => {
      res.json({ results: foundItem });
    })
    .catch((err) => {
      res.json(err);
    });
};

module.exports.updateOneItem = (req, res) => {
  Cart.find()
    .findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    })
    .then((updatedItem) => {
      res.json({ results: updatedItem });
    })
    .catch((err) => {
      res.json(err);
    });
};

module.exports.deleteOneItem = (req, res) => {
  Cart.find()
    .findOneAndRemove({ _id: req.params.id })
    .then((deletedItem) => {
      res.json({ results: deletedItem });
    })
    .catch((err) => {
      res.json(err);
    });
};