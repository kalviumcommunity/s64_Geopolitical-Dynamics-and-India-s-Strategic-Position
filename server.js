const express = require('express');
const app = express();

// Route for /ping with basic error handling
app.get('/ping', (req, res) => {
    try {
        res.send('pong');
    } catch (error) {
        res.status(500).send('An error occurred');
    }
});

// Use an environment variable for the port with a fallback to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});