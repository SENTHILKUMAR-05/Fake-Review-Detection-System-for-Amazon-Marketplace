const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/fake_review_db').then(() => {
    console.log("MongoDB Connected");
    seedAdmin();
}).catch(err => {
    console.log("MongoDB Connection Error:", err);
    process.exit(1);
});

async function seedAdmin() {
    const username = "senthil";
    const password = "9345";

    try {
        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log(`User '${username}' already exists. Updating password...`);
            existingUser.password = await bcrypt.hash(password, 10);
            await existingUser.save();
            console.log("Password updated successfully.");
        } else {
            console.log(`Creating user '${username}'...`);
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, password: hashedPassword });
            await newUser.save();
            console.log("User created successfully.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Error seeding user:", err);
        process.exit(1);
    }
}
