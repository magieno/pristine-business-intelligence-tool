CREATE TABLE IF NOT EXISTS `pluralsight_flow_comments` (
    id INT NOT NULL,
    pull_request_id INT NOT NULL,
    body TEXT,
    word_count INT,
    comment_robustness VARCHAR(255),
    was_influential TINYINT,
    apex_user_id INT,
    created_at DATETIME,
    CONSTRAINT pluralsight_flow_comments_id_pk PRIMARY KEY (id),
    CONSTRAINT pluralsight_flow_comments_apex_user_id_fk FOREIGN KEY (apex_user_id) REFERENCES pluralsight_flow_user(apex_user_id),
    INDEX pluralsight_flow_comments_apex_user_id_idx (apex_user_id),
    INDEX pluralsight_flow_comments_created_at_idx (created_at)
);
