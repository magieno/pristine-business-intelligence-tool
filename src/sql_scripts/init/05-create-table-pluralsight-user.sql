CREATE TABLE IF NOT EXISTS `pluralsight_user` (
    apex_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    CONSTRAINT pluralsight_user_apex_id_pk PRIMARY KEY (apex_id),
    CONSTRAINT pluralsight_user_user_id_fk FOREIGN KEY (user_id) REFERENCES user(id)
);