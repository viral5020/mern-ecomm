const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const crypto = require ('crypto');

const jwt = require ('jsonwebtoken');

const passport = require('passport');
const session = require('express-session');
const OAuth2Strategy = require('passport-google-oauth20').Strategy;

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopOrderRouter = require("./routes/shop/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes")
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopSearchRouter = require("../server/routes/shop/search-routes");
const shopReviewRouter = require("../server/routes/shop/review-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");
const categoryRoutes = require("./routes/admin/categoryRoutes");

const giftCardRoutes = require('./routes/admin/giftcard-routes');

const inventoryRoutes = require('./routes/admin/inventoryRoutes');

const emailRouter = require("./emailService");
const emailproductRouter = require("./emailproduct");

const userRoutes = require("./routes/auth/auth-routes");

const sendCheckoutNotification = require('./emailService');

const paymentRouter  = require("./routes/shop/payment");

const invoiceRoutes = require('./routes/admin/invoiceRoutes');

const newsletterRoutes = require('./routes/shop/newsletterRoutes');

const wishlistRoutes=require("./routes/shop/wishlistRoutes")

const Razorpay = require('razorpay');
const User = require('./models/User');


// Google OAuth credentials
const clientid = "1084059639381-ogqjb9u8cbjck8kfeo7d2aivs79e974k.apps.googleusercontent.com";
const clientsecret = "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";

mongoose.connect('mongodb+srv://viralajudia123:Viral023572@ecom.v7hqz.mongodb.net/')
    .then(() => console.log('mongoDB connected'))
    .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Expires', 'Pragma'],
        credentials: true,
    })
);



app.use(cookieParser());
app.use(express.json());

// setup session
app.use(session({
    secret: "YOUR SECRET KEY",
    resave: false,
    saveUninitialized: true
}));

// setup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = new User({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value
                });

                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Initial Google OAuth login
app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
      if (err) {
          console.log('OAuth Error:', err); // log the error
          return res.status(500).json({ error: 'OAuth authentication failed' });
      }
      if (!user) {
          return res.status(400).json({ error: 'User authentication failed' });
      }
      // Proceed with successful authentication, save user in session, etc.
      req.logIn(user, (err) => {
          if (err) {
              console.log('Login error:', err);
              return res.status(500).json({ error: 'Login failed' });
          }
          const token = jwt.sign(
                {
                  id: user._id,
                  role: user.role,
                  email: user.email,
                  userName: user.displayName,
                },
                "CLIENT_SECRET_KEY",
                { expiresIn: "7d" }
              );
          res.cookie("token", token, { httpOnly: true, secure: false })
        
          return res.redirect('http://localhost:5173/shop/home');
      });
  })(req, res, next);
});


// Logout
app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("http://localhost:5173");
    });
});


app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/categories", categoryRoutes);
app.use('/api/admin/invoices', invoiceRoutes);
app.use('/api/admin/inventory', inventoryRoutes); 

app.use("/api/wishlist", wishlistRoutes);
 

app.use('/api/newsletter', newsletterRoutes);

app.use("/api", userRoutes);

app.use('/api', giftCardRoutes);
app.use('/api/giftcards', giftCardRoutes);


app.use("/api/common/feature", commonFeatureRouter);

app.use(sendCheckoutNotification)
app.use(emailRouter)
app.use(emailproductRouter)
// Razorpay Payment API
app.post('/create-order', async (req, res) => {
    const { amount } = req.body; // Amount is expected in paise
  
    // Ensure the amount received is in paise and not INR
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
  
    // Create Razorpay order
    const options = {
      amount: amount, // Razorpay expects the amount in paise
      currency: "INR",
      receipt: "order_rcptid_11",
      payment_capture: 1, // Auto capture
    };
  
    try {
      const order = await razorpay.orders.create(options);
      return res.json(order); // Send the order ID, amount, and other details to the frontend
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return res.status(500).json({ error: "Failed to create Razorpay order" });
    }
  });
app.post("/verify-payment", async (req, res) => {
    const razorpay = new Razorpay({
        key_id: "rzp_test_GIlOKSWDgEOf6H",
        key_secret: "FqlwfORqRY8sFv80w9GJHyd7",
    });

    try {
      const{
        paymentId,
        orderId,
        signature,
      }=req.body 

      
     const secret = "FqlwfORqRY8sFv80w9GJHyd7"

     const hash = crypto.createHmac('sha256',secret)

     hash.update (orderId + "|" + paymentId);

     const generatedSignature  = hash.digest('hex')

       console.log(generatedSignature);
       console.log(signature);
       
       
     if (generatedSignature !== signature){
        return res.status(500).json({message: "payment not verify"});
     }
       


       res.status(200).json({message: "payment verified"})

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports ={app}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
