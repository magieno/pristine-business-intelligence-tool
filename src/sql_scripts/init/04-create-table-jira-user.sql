CREATE TABLE IF NOT EXISTS `jira_user` (
    id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    CONSTRAINT jira_user_id_pk PRIMARY KEY (id),
    CONSTRAINT jira_user_user_id_fk FOREIGN KEY (user_id) REFERENCES user(id)
);