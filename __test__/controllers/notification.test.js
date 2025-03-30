import { retrieveStudents } from '../../controllers/notification-controller.js';
import Student from '../../models/student.js';
import Teacher from '../../models/teacher.js';

// Mock the models
jest.mock('../../models/student.js');
jest.mock('../../models/teacher.js');

describe('Notification Controller', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    describe('retrieveStudents', () => {
        it('should return 400 for invalid request format', async () => {
            const req = {
                body: {} // Missing teacher and notification
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await retrieveStudents(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid request format' });
        });

        it('should return 404 if teacher does not exist', async () => {
            const req = {
                body: {
                    teacher: 'nonexistent@example.com',
                    notification: 'Hello students!'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Teacher.findByEmail.mockResolvedValue(null);

            await retrieveStudents(req, res);

            expect(Teacher.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Teacher with email nonexistent@example.com does not exist'
            });
        });

        it('should return students registered with teacher and not suspended', async () => {
            const req = {
                body: {
                    teacher: 'teacher@example.com',
                    notification: 'Hello students!'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock teacher exists
            const mockTeacher = {
                email: 'teacher@example.com',
                getStudents: jest.fn().mockResolvedValue([
                    { student_email: 'student1@example.com' },
                    { student_email: 'student2@example.com' }
                ])
            };
            Teacher.findByEmail.mockResolvedValue(mockTeacher);

            // Mock student statuses
            Student.findByEmail.mockImplementation(async (email) => {
                if (email === 'student1@example.com') {
                    return { email, suspend_tag: 0 }; // Not suspended
                } else if (email === 'student2@example.com') {
                    return { email, suspend_tag: 1 }; // Suspended
                }
                return null;
            });

            await retrieveStudents(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                students: ['student1@example.com'] // Only non-suspended student
            });
        });

        it('should include mentioned students who are not suspended', async () => {
            const req = {
                body: {
                    teacher: 'teacher@example.com',
                    notification: 'Hello @student3@example.com and @student4@example.com!'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock teacher exists with no registered students
            const mockTeacher = {
                email: 'teacher@example.com',
                getStudents: jest.fn().mockResolvedValue([])
            };
            Teacher.findByEmail.mockResolvedValue(mockTeacher);

            // Mock student statuses for mentioned students
            Student.findByEmail.mockImplementation(async (email) => {
                if (email === 'student3@example.com') {
                    return { email, suspend_tag: 0 }; // Not suspended
                } else if (email === 'student4@example.com') {
                    return { email, suspend_tag: 1 }; // Suspended
                }
                return null;
            });

            await retrieveStudents(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                students: ['student3@example.com'] // Only non-suspended mentioned student
            });
        });

        it('should handle internal server errors', async () => {
            const req = {
                body: {
                    teacher: 'teacher@example.com',
                    notification: 'Hello students!'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Force an error
            Teacher.findByEmail.mockRejectedValue(new Error('Database error'));

            await retrieveStudents(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
        });
    });
});