import {inject, injectable} from "tsyringe";
import {User} from "../models/user.model";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import { v4 as uuidv4 } from 'uuid';
import {BadRequestHttpError} from "@pristine-ts/networking";
import {JiraUser} from "../models/jira-user.model";
import {PluralsightFlowUser} from "../models/pluralsight-flow-user.model";

@injectable()
export class PluralsightFlowUserRepository {
    constructor(private readonly mysqlClient: MysqlClient, @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    public createOrUpdate(apexUserId: string, userId: string): Promise<PluralsightFlowUser> {
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

    public get(apexUserId: string): Promise<PluralsightFlowUser | null> {
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

                if(results.length === 0) {
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
                }

                if(results.length === 0) {
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

    public addUserAlias(apexUserId: string, aliasUserId: string): Promise<void> {
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

                    switch(error.code) {
                        case "ER_DUP_ENTRY":
                            return reject(new BadRequestHttpError("The alias is already associated to this user.", [error]));
                    }
                }


                return resolve();
            });

            connection.end();
        })
    }

    public removeUserAlias(apexUserId: string, aliasUserId: string): Promise<void> {
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
}
