CREATE TABLE IF NOT EXISTS `user` (
    id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    CONSTRAINT user_id_pk PRIMARY KEY (id),
    CONSTRAINT user_unique_email UNIQUE (email)
);
