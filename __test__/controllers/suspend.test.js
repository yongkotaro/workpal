import { suspend } from '../../controllers/suspend-controller.js';
import Student from '../../models/student.js';

jest.mock('../../models/student');

describe('suspend controller', () => {
    let mockReq, mockRes, mockStudent;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            body: {
                student: 'student@example.com'
            }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        mockStudent = {
            email: 'student@example.com',
            suspend_tag: 0,
            suspend: jest.fn().mockResolvedValue(undefined)
        };
    });

    it('should suspend an existing student successfully', async () => {
        Student.findByEmail.mockResolvedValue(mockStudent);
        await suspend(mockReq, mockRes);
        expect(mockStudent.suspend).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should return 400 for missing student email', async () => {
        mockReq.body.student = null;
        await suspend(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 for non-existent student', async () => {
        Student.findByEmail.mockResolvedValue(null);
        await suspend(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should handle database errors during suspension', async () => {
        Student.findByEmail.mockResolvedValue(mockStudent);
        mockStudent.suspend.mockRejectedValue(new Error('Update failed'));
        await suspend(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
});