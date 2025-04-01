const User = require("../models/User");

const loginWithGoogle = async (req, res) => {
    const { email, name } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
        user = new User({ name, email });
        await user.save();
    }

    res.json(user);
};

module.exports = { loginWithGoogle };
