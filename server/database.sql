-- Таблица юзеров

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(127) UNIQUE NOT NULL,
    name VARCHAR(127) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(127) DEFAULT 'USER' NOT NULL,
    diskSpace INTEGER DEFAULT 3000,
    usedSpace INTEGER DEFAULT 0,
    avatar VARCHAR(255),
    time TIMESTAMP DEFAULT now()
);

SELECT name FROM users WHERE name = 'user1'

INSERT INTO users (name, password, role)
VALUES 
('user1', '12345', 'USER');

ALTER TABLE users
ALTER COLUMN name
DROP UNIQUE;