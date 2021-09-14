CREATE TABLE IF NOT EXISTS `scheduled_task` (
       task_name VARCHAR(255),
       last_run_at DATETIME,
       CONSTRAINT scheduled_task_task_name_pk PRIMARY KEY (task_name)
);
