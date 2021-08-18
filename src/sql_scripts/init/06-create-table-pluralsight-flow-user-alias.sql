CREATE TABLE IF NOT EXISTS `pluralsight_flow_user_alias` (
    apex_user_id VARCHAR(255) NOT NULL,
    alias_user_id VARCHAR(255) NOT NULL,
    CONSTRAINT pluralsight_flow_user_alias_apex_user_id_pk PRIMARY KEY (apex_user_id),
    CONSTRAINT pluralsight_flow_user_alias_apex_user_id_fk FOREIGN KEY (apex_user_id) REFERENCES pluralsight_flow_user(apex_user_id),
    CONSTRAINT unique_pluralsight_flow_user_alias_alias_user_id UNIQUE (alias_user_id)
);