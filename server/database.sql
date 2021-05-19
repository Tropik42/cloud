-- Таблица юзеров

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(127) UNIQUE NOT NULL,
    name VARCHAR(127) UNIQUE,
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

--Удалил атрибут у столбца name
ALTER TABLE users
ALTER COLUMN name
DROP NOT NULL;

-- таблица файлов

CREATE TABLE files(
    file_id BIGSERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    accessLink VARCHAR(255),
    size INTEGER DEFAULT 0,
    path VARCHAR(255) DEFAULT "",
    date DATE DEFAULT now(),
    user_id INTEGER REFERENCES users (user_id)
);

ALTER TABLE ADD date DATE DEFAULT now();

INSERT INTO files (name, type, user_id)
VALUES ('test3', 'type3', 1);
