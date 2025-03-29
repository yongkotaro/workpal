import express from 'express';
import registerRoutes from "./routes/register-route.js";

const app = express();

// parse json bodies in the request object
app.use(express.json());

// route for registering student(s) to a teacher
app.use("/api/register", registerRoutes);

// health check
app.get("/", (_, res) => {
    return res.status(200).json({
        status: "healthy",
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));