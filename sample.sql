BEGIN;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE classes; 
TRUNCATE TABLE students; 
TRUNCATE TABLE teachers; 

INSERT INTO teachers (email) VALUES
('teacherken@gmail.com'),
('teachermary@gmail.com'),
('teacherjohn@gmail.com');

INSERT INTO students (email, suspend_tag) VALUES
('studentjon@gmail.com', 0),  
('studentalex@gmail.com', 0),
('studentlucy@gmail.com', 0);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;