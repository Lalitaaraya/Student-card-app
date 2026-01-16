-- Run this script to create the database and students table
-- Example: mysql -u root -p < db_schema.sql

CREATE DATABASE IF NOT EXISTS techoon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techoon;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alt_phone VARCHAR(20),
  email VARCHAR(150) NOT NULL,
  company VARCHAR(200),
<<<<<<< HEAD
  photo LONGBLOB, -- Changed from LONGTEXT to LONGBLOB for binary data
  photo_mime_type VARCHAR(50), -- Added to store the MIME type (e.g., 'image/png', 'image/jpeg')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
=======
  photo LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;    
>>>>>>> 7d688a02aa63c2ca8791695c77e93e308165604d
