const Wishlist = require("../../models/Wishlist")

exports.create = async (req, res) => {
  try {
    const {
      userId,
      productId,
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      weight,
      totalStock,
      averageReview
    } = req.body;

    // Check if the product is already in the user's wishlist
    const existingWishlistItem = await Wishlist.findOne({ 
      userId: userId, 
      productId: productId 
    });

    if (existingWishlistItem) {
      // If the product is already in the wishlist, send a response with an error
      return res.status(400).json({
        success: false,
        message: 'Product is already in your wishlist',
      });
    }

    // Create a new wishlist item with the product details
    const newWishlistItem = new Wishlist({
      userId: userId,
      productId: productId,
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      weight,
      totalStock,
      averageReview,
    });

    const created = await newWishlistItem.save(); // Save to the database

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: created,
    });
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product to wishlist, please try again later',
    });
  }
};

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        let skip=0
        let limit=0

        if(req.query.page && req.query.limit){
            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const result=await Wishlist.find({user:id}).skip(skip).limit(limit).populate({path:"product",populate:['brand']})
        const totalResults=await Wishlist.find({user:id}).countDocuments().exec()

        res.set("X-Total-Count",totalResults)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error fetching your wishlist, please try again later"})
    }
}
exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Wishlist.findByIdAndUpdate(id,req.body,{new:true}).populate("product")
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error updating your wishlist, please try again later"})
    }
}
exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Wishlist.findByIdAndDelete(id)
        return res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error deleting that product from wishlist, please try again later"})
    }
}