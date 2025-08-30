// controllers/searchController.js
const Product = require('../models/productModel');
const Location = require('../models/locationModel');
const Order = require('../models/orderModel');
const Category = require('../models/categurieModel');
const User = require('../models/userModel');
exports.search = async (req, res) => {
    const query = req.query.q;
    try {
        const products = await Product.find({
            $or:[{'name.en':{$regex:query,$options:'i'}},{'name.ar':{$regex:query,$options:'i'}},
                {'image':{$regex:query,$options:'i'}},{'description.en':{$regex:query,$options:'i'}},
                {'description.ar':{$regex:query,$options:'i'}},{'size.ar':{$regex:query,$options:'i'}},
                {'size.en':{$regex:query,$options:'i'}},
                {'shape.ar':{$regex:query,$options:'i'}},{'shape.ar':{$regex:query,$options:'i'}},
                {'flavor.ar':{$regex:query,$options:'i'}},{'flavor.ar':{$regex:query,$options:'i'}}]
        });

        const locations = await Location.find({ $or:[{'region.en':{$regex:query,$options:'i'}},
            {'region.ar':{$regex:query,$options:'i'}},  {'street.ar':{$regex:query,$options:'i'}}, 
            {'street.en':{$regex:query,$options:'i'}}] });

        const categories = await Category.find({ $or:[{'name.en':{$regex:query,$options:'i'}},
            {'name.ar':{$regex:query,$options:'i'}}, {'descreption.ar':{$regex:query,$options:'i'}},
            {'descreption.en':{$regex:query,$options:'i'}}] });

        const orders = await Order.find({ $or:[{'paidstatus.en':{$regex:query,$options:'i'}},
            {'paidstatus.ar':{$regex:query,$options:'i'}}] });

        const users = await User.find({ name: new RegExp(query, 'i') });
        res.json({
            products,
            locations,
            orders,
            categories,
            users
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error });
    }
};
