CREATE TABLE IF NOT EXISTS `pluralsight_flow_pull_request` (
    id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    apex_user_id INT NOT NULL,
    merged_by_user_alias_id INT NOT NULL,
    coding_time BIGINT,
    review_time BIGINT,
    number_of_commits BIGINT NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    CONSTRAINT pluralsight_flow_pull_request_id_pk PRIMARY KEY (id),
    CONSTRAINT pluralsight_flow_pull_request_apex_user_id_fk FOREIGN KEY (apex_user_id) REFERENCES pluralsight_flow_user(apex_user_id)
);
