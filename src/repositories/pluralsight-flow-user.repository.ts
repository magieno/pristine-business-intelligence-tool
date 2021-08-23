import {inject, injectable} from "tsyringe";
import {User} from "../models/user.model";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import {v4 as uuidv4} from 'uuid';
import {BadRequestHttpError} from "@pristine-ts/networking";
import {JiraUser} from "../models/jira-user.model";
import {PluralsightFlowUser} from "../models/pluralsight-flow-user.model";
import {format} from "date-fns";
import {PluralsightFlowPullRequestModel} from "../models/pluralsight-flow-pull-request.model";
import {PluralsightFlowCommitModel} from "../models/pluralsight-flow-commit.model";
import {PluralsightFlowCommentModel} from "../models/pluralsight-flow-comment.model";

@injectable()
export class PluralsightFlowUserRepository {
    constructor(private readonly mysqlClient: MysqlClient, @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    public createOrUpdate(apexUserId: number, userId: string): Promise<PluralsightFlowUser> {
        return new Promise<PluralsightFlowUser>((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "INSERT INTO pluralsight_flow_user(apex_user_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE " +
                    "apex_user_id = ?," +
                    "user_id = ?",
                values: [
                    apexUserId,
                    userId,
                    apexUserId,
                    userId
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                const pluralsightFlowUser = new PluralsightFlowUser();
                pluralsightFlowUser.apexUserId = apexUserId;
                return resolve(pluralsightFlowUser);
            });

            connection.end();
        })
    }

    public get(apexUserId: number): Promise<PluralsightFlowUser | null> {
        return new Promise<PluralsightFlowUser | null>((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT pluralsight_flow_user.apex_user_id, user_id, email FROM pluralsight_flow_user INNER JOIN `user` ON `user`.id = pluralsight_flow_user.user_id WHERE pluralsight_flow_user.apex_user_id = ?",
                values: [
                    apexUserId
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                if (results.length === 0) {
                    return resolve(null);
                }

                // Construct the Pluralsight Flow user.

                const row = results[0];

                const pluralsightFlowUser = new PluralsightFlowUser();
                pluralsightFlowUser.apexUserId = row.apex_user_id;

                pluralsightFlowUser.user = new User();
                pluralsightFlowUser.user.id = row.user_id;
                pluralsightFlowUser.user.email = row.email;

                // Lookup the aliases
                connection.query({
                    sql: "SELECT * FROM pluralsight_flow_user_alias WHERE apex_user_id = ?",
                    values: [
                        apexUserId
                    ],
                }, (error, results, fields) => {
                    if (error) {
                        this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                    }

                    results.forEach(row => {
                        pluralsightFlowUser.aliases.push(row.alias_user_id);
                    })

                    return resolve(pluralsightFlowUser);
                });

                connection.end();
            });

        });
    }

    public getFromUserId(userId: string): Promise<PluralsightFlowUser | null> {
        return new Promise<PluralsightFlowUser | null>((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT pluralsight_flow_user.apex_user_id, user_id, email FROM pluralsight_flow_user INNER JOIN `user` ON `user`.id = pluralsight_flow_user.user_id WHERE pluralsight_flow_user.user_id = ?",
                values: [
                    userId
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})

                    return reject();
                }

                if (results.length === 0) {
                    return resolve(null);
                }

                // Construct the Pluralsight Flow user.

                const row = results[0];

                const pluralsightFlowUser = new PluralsightFlowUser();
                pluralsightFlowUser.apexUserId = row.apex_user_id;

                pluralsightFlowUser.user = new User();
                pluralsightFlowUser.user.id = row.user_id;
                pluralsightFlowUser.user.email = row.email;

                // Lookup the aliases
                connection.query({
                    sql: "SELECT * FROM pluralsight_flow_user_alias WHERE apex_user_id = ?",
                    values: [
                        pluralsightFlowUser.apexUserId,
                    ],
                }, (error, results, fields) => {
                    if (error) {
                        this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                    }

                    results.forEach(row => {
                        pluralsightFlowUser.aliases.push(row.alias_user_id);
                    })

                    return resolve(pluralsightFlowUser);
                });

                connection.end();
            });

        });
    }

    public findAll(offset: number = 0, limit: number = 100): Promise<PluralsightFlowUser[]> {
        return new Promise<PluralsightFlowUser[]>((resolve, reject) => {
            const pluralsightFlowUsers: PluralsightFlowUser[] = [];

            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT pluralsight_flow_user.apex_user_id, user_id, email FROM pluralsight_flow_user INNER JOIN `user` ON `user`.id = pluralsight_flow_user.user_id LIMIT ?,?",
                values: [
                    offset,
                    limit,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                results.forEach(row => {
                    const pluralsightFlowUser = new PluralsightFlowUser();
                    pluralsightFlowUser.apexUserId = row.apex_user_id;

                    pluralsightFlowUser.user = new User();
                    pluralsightFlowUser.user.id = row.user_id;
                    pluralsightFlowUser.user.email = row.email;

                    // Lookup the aliases
                    connection.query({
                        sql: "SELECT * FROM pluralsight_flow_user_alias WHERE apex_user_id = ?",
                        values: [
                            row.apex_user_id
                        ],
                    }, (error, results, fields) => {
                        if (error) {
                            this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                        }

                        results.forEach(row => {
                            pluralsightFlowUser.aliases.push(row.alias_user_id);
                        })

                        return resolve(pluralsightFlowUsers);
                    });

                    pluralsightFlowUsers.push(pluralsightFlowUser);
                })

                connection.end();

            });
        });
    }

    public addUserAlias(apexUserId: number, aliasUserId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "INSERT INTO pluralsight_flow_user_alias(apex_user_id, alias_user_id) VALUES (?, ?)",
                values: [
                    apexUserId,
                    aliasUserId,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})

                    switch (error.code) {
                        case "ER_DUP_ENTRY":
                            return reject(new BadRequestHttpError("The alias is already associated to this user.", [error]));
                    }
                }


                return resolve();
            });

            connection.end();
        })
    }

    public addUserAliases(apexUserId: number, aliasUserIds: number[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            const promises: Promise<void>[] = [];

            aliasUserIds.forEach(aliasUserId => {
                promises.push(new Promise<void>(resolve1 => {
                    connection.query({
                        sql: "INSERT INTO pluralsight_flow_user_alias(apex_user_id, alias_user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE alias_user_id = ?",
                        values: [
                            apexUserId,
                            aliasUserId,
                            aliasUserId,
                        ],
                    }, (error, results, fields) => {
                        if (error) {
                            this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})

                            switch (error.code) {
                                case "ER_DUP_ENTRY":
                                    return reject(new BadRequestHttpError("The alias is already associated to this user.", [error]));
                            }
                        }

                        return resolve1();
                    });
                }))
            })


            connection.end();

            await Promise.all(promises);

            return resolve();
        })
    }

    public removeUserAlias(apexUserId: number, aliasUserId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "DELETE FROM pluralsight_flow_user_alias WHERE apex_user_id = ? AND alias_user_id = ?",
                values: [
                    apexUserId,
                    aliasUserId,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                return resolve();
            });

            connection.end();
        })
    }

    public savePullRequests(pullRequests: PluralsightFlowPullRequestModel[]): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            const promises: Promise<void>[] = [];

            pullRequests.forEach(pullRequest => {
                // Save the pluralsight flow reviewers
                pullRequest.reviewerUserAliasIds.forEach(reviewerId => {
                    promises.push(new Promise<void>(resolve1 => {
                        connection.query({
                            sql: "INSERT INTO pluralsight_flow_reviewers (pull_request_id, reviewer_user_alias_id, created_at) VALUES (?,?, ?) ON DUPLICATE KEY UPDATE " +
                                "reviewer_user_alias_id = ?, created_at = ?",
                            values: [
                                pullRequest.id,
                                reviewerId,
                                format(pullRequest.createdAt, "yyyy-MM-dd hh:mm:ss"),
                                reviewerId,
                                format(pullRequest.createdAt, "yyyy-MM-dd hh:mm:ss"),
                            ],
                        }, (error, results, fields) => {
                            if (error) {
                                this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                            }

                            return resolve1();
                        });
                    }));
                })


                promises.push(new Promise<void>(resolve1 => {
                    connection.query({
                        sql: "INSERT INTO pluralsight_flow_pull_request (id, title, url, created_at, apex_user_id, merged_by_user_alias_id, coding_time, review_time, number_of_commits, started_at, ended_at, first_comment_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE " +
                            "title = ?, url = ?, created_at = ?, apex_user_id = ?, merged_by_user_alias_id = ?, coding_time = ?, review_time = ?, number_of_commits = ?, started_at = ?, ended_at = ?, first_comment_at = ?",
                        values: [
                            pullRequest.id,
                            pullRequest.title,
                            pullRequest.url,
                            format(pullRequest.createdAt, "yyyy-MM-dd hh:mm:ss"),
                            pullRequest.apexUserId,
                            pullRequest.mergedByUserAliasId,
                            pullRequest.codingTime ?? undefined,
                            pullRequest.reviewTime ?? undefined,
                            pullRequest.numberOfCommits,
                            format(pullRequest.startedAt, "yyyy-MM-dd hh:mm:ss"),
                            pullRequest.endedAt ? format(pullRequest.endedAt, "yyyy-MM-dd hh:mm:ss") : undefined,
                            pullRequest.firstCommentAt ? format(pullRequest.firstCommentAt, "yyyy-MM-dd hh:mm:ss") : undefined,
                            pullRequest.title,
                            pullRequest.url,
                            format(pullRequest.createdAt, "yyyy-MM-dd hh:mm:ss"),
                            pullRequest.apexUserId,
                            pullRequest.mergedByUserAliasId,
                            pullRequest.codingTime ?? undefined,
                            pullRequest.reviewTime ?? undefined,
                            pullRequest.numberOfCommits,
                            format(pullRequest.startedAt, "yyyy-MM-dd hh:mm:ss"),
                            pullRequest.endedAt ? format(pullRequest.endedAt, "yyyy-MM-dd hh:mm:ss") : undefined,
                            pullRequest.firstCommentAt ? format(pullRequest.firstCommentAt, "yyyy-MM-dd hh:mm:ss") : undefined,
                        ],
                    }, (error, results, fields) => {
                        if (error) {
                            this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                        }

                        return resolve1();
                    });
                }))

            })

            connection.end();

            await Promise.all(promises);

            return resolve();
        })
    }

    public saveCommits(commits: PluralsightFlowCommitModel[]): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            const promises: Promise<void>[] = [];

            commits.forEach(commit => {
                promises.push(new Promise<void>(resolve1 => {
                    connection.query({
                        sql: "INSERT INTO pluralsight_flow_commits (id, created_at, apex_user_id, is_merge, sha) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE " +
                            "created_at = ?, apex_user_id = ?, is_merge = ?, sha = ?",
                        values: [
                            commit.id,
                            format(commit.createdAt, "yyyy-MM-dd hh:mm:ss"),
                            commit.apexUserId,
                            commit.isMerge ? 1 : 0,
                            commit.sha,
                            format(commit.createdAt, "yyyy-MM-dd hh:mm:ss"),
                            commit.apexUserId,
                            commit.isMerge ? 1 : 0,
                            commit.sha,
                        ],
                    }, (error, results, fields) => {
                        if (error) {
                            this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                        }

                        return resolve1();
                    });
                }))

            })

            connection.end();

            await Promise.all(promises);

            return resolve();
        })
    }

    public saveComments(comments: PluralsightFlowCommentModel[]): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            const promises: Promise<void>[] = [];
            comments.forEach(comment => {
                promises.push(new Promise<void>(resolve1 => {
                    connection.query({
                        sql: "INSERT INTO pluralsight_flow_comments (id, pull_request_id, body, word_count, comment_robustness, was_influential, apex_user_id, created_at) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE " +
                            "pull_request_id = ?, body = ?, word_count = ?, comment_robustness = ?, was_influential = ?, apex_user_id = ?, created_at = ?",
                        values: [
                            comment.id,
                            comment.pullRequestId,
                            comment.body,
                            comment.wordCount,
                            comment.commentRobustness,
                            comment.wasInfluential? 1 : 0,
                            comment.apexUserId,
                            format(comment.createdAt, "yyyy-MM-dd hh:mm:ss"),
                            comment.pullRequestId,
                            comment.body,
                            comment.wordCount,
                            comment.commentRobustness,
                            comment.wasInfluential? 1 : 0,
                            comment.apexUserId,
                            format(comment.createdAt, "yyyy-MM-dd hh:mm:ss"),
                        ],
                    }, (error, results, fields) => {
                        if (error) {
                            this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                        }

                        return resolve1();
                    });
                }));
            });

            connection.end();

            await Promise.all(promises);

            return resolve();
        })
    }
}
