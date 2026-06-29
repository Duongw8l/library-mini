-- =============================================================
-- Hệ thống Quản lý Thư viện Mini — DDL tham chiếu (PostgreSQL)
-- Nguồn chính thức là Prisma (backend/prisma/schema.prisma).
-- File này phục vụ tra cứu / dựng tay khi không dùng Prisma migrate.
-- =============================================================

-- Kiểu liệt kê (enum)
CREATE TYPE role AS ENUM ('STUDENT', 'LIBRARIAN', 'ADMIN');
CREATE TYPE loan_status AS ENUM ('PENDING', 'BORROWED', 'OVERDUE', 'RETURNED', 'REJECTED');

-- Người dùng
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    full_name   VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        role NOT NULL DEFAULT 'STUDENT',
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Thể loại
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tác giả
CREATE TABLE authors (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    bio         TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sách (đầu sách)
CREATE TABLE books (
    id                SERIAL PRIMARY KEY,
    title             VARCHAR(500) NOT NULL,
    isbn              VARCHAR(50) UNIQUE,
    description       TEXT,
    publisher         VARCHAR(255),
    published_year    INT,
    cover_url         VARCHAR(500),
    total_copies      INT NOT NULL DEFAULT 1,
    available_copies  INT NOT NULL DEFAULT 1,
    category_id       INT REFERENCES categories(id),
    author_id         INT REFERENCES authors(id),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_category ON books(category_id);

-- Phiếu mượn
CREATE TABLE loans (
    id             SERIAL PRIMARY KEY,
    book_id        INT NOT NULL REFERENCES books(id),
    user_id        INT NOT NULL REFERENCES users(id),
    status         loan_status NOT NULL DEFAULT 'PENDING',
    requested_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    borrowed_at    TIMESTAMP,
    due_date       TIMESTAMP,
    returned_at    TIMESTAMP,
    renewal_count  INT NOT NULL DEFAULT 0,
    fine_amount    INT NOT NULL DEFAULT 0,
    reject_reason  VARCHAR(500)
);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_user ON loans(user_id);

-- Lịch sử gia hạn
CREATE TABLE loan_renewals (
    id            SERIAL PRIMARY KEY,
    loan_id       INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    old_due_date  TIMESTAMP NOT NULL,
    new_due_date  TIMESTAMP NOT NULL,
    renewed_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cấu hình hệ thống (key/value)
CREATE TABLE settings (
    key    VARCHAR(100) PRIMARY KEY,
    value  VARCHAR(255) NOT NULL
);
