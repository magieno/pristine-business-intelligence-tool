CREATE TABLE IF NOT EXISTS `pluralsight_flow_reviews` (
    pull_request_id INT NOT NULL,
    reviewer_user_alias_id INT NOT NULL,
    CONSTRAINT pluralsight_flow_reviews_pull_request_id_pk PRIMARY KEY (pull_request_id, reviewer_user_alias_id),
    CONSTRAINT pluralsight_flow_reviews_pull_request_pull_request_id_fk FOREIGN KEY (pull_request_id) REFERENCES pluralsight_flow_pull_request(id)
);
