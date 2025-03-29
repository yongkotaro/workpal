import Student from "../models/student.js";

export const suspend = async (req, res) => {
    try {
        const { student } = req.body;

        // Validate request 
        if (!student) {
            return res.status(400).json({ message: 'Invalid request format' });
        }

        // Check if student exists
        const studentInstance = await Student.findByEmail(student);
        if (!studentInstance) {
            return res.status(400).json({
                message: `Student with  ${student} does not exist'`
            });
        }

        // Suspend the student
        await studentInstance.suspend();

        res.status(204).send();

    } catch (error) {
        console.error("Error in suspend controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};