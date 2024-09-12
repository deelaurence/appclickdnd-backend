const User = require('./loginModel');
const sendVerificationEmail = require('./mail');  // Helper function for sending emails
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'someSecretKey';
const CLIENT_URL = process.env.client_url 

const loginController = async (req, res) => {
    const { email, password } = req.body;
    const serverUrl = `${req.protocol}://${req.get('host')}`
    
    try {
        // Find user by email
        const user = await User.findOne({ email });
        
        const handleMail = async (user,email)=>{
            const link = `${serverUrl}/validate-email/${generateJwtToken(user)}`
            console.log(link)
            
            await sendVerificationEmail(email,"User",link);
            return res.status(403).json({ error: "Check your mailbox for a verification link" });
        }



        // Check if user is available
        if (!user) {
        // Send verification email
        console.log(email);
        const newUser=await User.create(req.body);
        await handleMail(newUser,email)
        return
        }
        
        
        // Check if user is verified
        if (!user.isVerified) {
        await handleMail(user,email)
        return
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password); // Updated to bcrypt comparison
        if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid credentials" });
        }

        // If everything is fine, log in the user by generating a JWT token
        const token = generateJwtToken(user);  // Call the function to generate a JWT token
        res.json({ message: "Login successful", token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// JWT token generation function
function generateJwtToken(user) {
  const payload = {
    id: user._id,
    email: user.email
  };

  // Sign the JWT token with a secret key
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
  return token;
}


const verifyController = async (req, res) => {
    const { token } = req.params; // Extract token from the URL
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
  
      // Find the user by ID decoded from the token
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
  
      // Check if user is already verified
      if (user.isVerified) {
        return res.redirect(`${CLIENT_URL}/?verified=true`);
      }
  
      // Update user as verified
      user.isVerified = true;
      await user.save();
  
      // Redirect to client login page
      return res.redirect(`${CLIENT_URL}/?verified=true`);
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  };


module.exports = { loginController,verifyController };
