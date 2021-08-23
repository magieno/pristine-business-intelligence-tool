CREATE TABLE IF NOT EXISTS `pluralsight_flow_commits` (
    id INT NOT NULL,
    created_at DATETIME NOT NULL,
    apex_user_id INT NOT NULL,
    is_merge TINYINT(1) NOT NULL,
    sha VARCHAR(255) NOT NULL,
    CONSTRAINT pluralsight_flow_commits_id_pk PRIMARY KEY (id),
    CONSTRAINT pluralsight_flow_commits_apex_user_id_fk FOREIGN KEY (apex_user_id) REFERENCES pluralsight_flow_user(apex_user_id),
    INDEX pluralsight_flow_commits_sha_idx (sha),
    INDEX pluralsight_flow_commits_apex_user_id_idx (apex_user_id),
    INDEX pluralsight_flow_comments_created_at_idx (created_at)
);
