CREATE TABLE IF NOT EXISTS `pluralsight_flow_user` (
    apex_user_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    CONSTRAINT pluralsight_flow_user_apex_user_id_pk PRIMARY KEY (apex_user_id),
    CONSTRAINT pluralsight_flow_user_user_id_fk FOREIGN KEY (user_id) REFERENCES user(id)
);