CREATE TABLE IF NOT EXISTS `team_member` (
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    CONSTRAINT team_member_team_user_pk PRIMARY KEY (team_id, user_id),
    CONSTRAINT team_member_team_id_fk FOREIGN KEY (team_id) REFERENCES team(id),
    CONSTRAINT team_member_user_id_fk FOREIGN KEY (user_id) REFERENCES user(id)
);