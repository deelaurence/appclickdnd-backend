const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const { loginController, verifyController } = require("./loginController");
const { authenticateToken } = require('./authMiddleware'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());
app.use(morgan('tiny'));

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/appDB'; 

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Ensure the 'videos' folder exists
const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

// MongoDB schema and model
const videoSchema = new mongoose.Schema({
  url: String,
  videoPath: String,
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

// A protected route that requires a valid JWT
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted to protected resource', user: req.user });
});

app.get('/validate-email/:token', verifyController);

app.post('/api/download-youtube-video', async (req, res) => {
  const { url } = req.body;
  try {
    const videoPath = path.join(videosDir, `video-${Date.now()}.mp4`);
    await youtubedl(url, {
      output: videoPath,
      format: 'mp4'
    });

    // Send the video file as a file stream
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);

    videoStream.on('end', () => console.log("Video stream ended"));
  } catch (error) {
    console.error("Error downloading video", error);
    res.status(500).send({ error: 'Error downloading video' });
  }
});

app.post("/login", loginController);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
