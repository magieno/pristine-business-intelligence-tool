CREATE TABLE IF NOT EXISTS `extraction_request` (
    id VARCHAR(36) NOT NULL,
    user_ids TEXT,
    team_ids TEXT,
    service VARCHAR(255) NOT NULL,
    datapoints TEXT,
    status VARCHAR(255) NOT NULL,
    total_number_of_extractions BIGINT,
    completed_extractions BIGINT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    CONSTRAINT extraction_request_id_pk PRIMARY KEY (id),
    INDEX extraction_request_status_idx (status),
    INDEX extraction_request_service_idx (service)
);
