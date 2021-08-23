CREATE TABLE IF NOT EXISTS `pluralsight_flow_reviewers` (
    pull_request_id INT NOT NULL,
    reviewer_user_alias_id INT NOT NULL,
    created_at DATETIME,
    CONSTRAINT pluralsight_flow_reviewers_pull_request_id_pk PRIMARY KEY (pull_request_id, reviewer_user_alias_id),
    CONSTRAINT pluralsight_flow_reviewers_pull_request_id_fk FOREIGN KEY (pull_request_id) REFERENCES pluralsight_flow_pull_request(id),
    INDEX pluralsight_flow_reviewers_reviewer_user_alias_id_idx (reviewer_user_alias_id),
    INDEX pluralsight_flow_comments_created_at_idx (created_at)
);
