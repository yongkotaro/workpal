import express from 'express';

const app = express();

// parse json bodies in the request object
app.use(express.json());

// health check
app.get("/", (_, res) => {
    return res.status(200).json({
        status: "healthy",
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));