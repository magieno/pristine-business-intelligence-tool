import {inject, injectable} from "tsyringe";
import {User} from "../models/user.model";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import { v4 as uuidv4 } from 'uuid';
import {BadRequestHttpError} from "@pristine-ts/networking";
import {JiraUser} from "../models/jira-user.model";

@injectable()
export class JiraUserRepository {
    constructor(private readonly mysqlClient: MysqlClient, @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    public createOrUpdate(id: string, userId: string): Promise<JiraUser> {
        return new Promise<JiraUser>(async (resolve, reject) => {
            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "INSERT INTO jira_user(id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE " +
                    "id = ?," +
                    "user_id = ?",
                values: [
                    id,
                    userId,
                    id,
                    userId
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                const jiraUser = new JiraUser();
                jiraUser.id = id;
                return resolve(jiraUser);
            });

            connection.end();
        })
    }

    public get(id: string): Promise<JiraUser | null> {
        return new Promise<JiraUser | null>(async (resolve, reject) => {
            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT jira_user.id, user_id, email FROM jira_user INNER JOIN `user` ON `user`.id = jira_user.user_id WHERE jira_user.id = ?",
                values: [
                    id
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                if(results.length === 0) {
                    return resolve(null);
                }

                const row = results[0];

                const jiraUser = new JiraUser();
                jiraUser.id = row.id;

                jiraUser.user = new User();
                jiraUser.user.id = row.user_id;
                jiraUser.user.email = row.email;

                return resolve(jiraUser);
            });

            connection.end();
        });
    }

    public findAll(offset: number = 0, limit: number = 100): Promise<JiraUser[]> {
        return new Promise<JiraUser[]>(async (resolve, reject) => {
            const jiraUsers: JiraUser[] = [];

            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT jira_user.id, user_id, email FROM jira_user INNER JOIN `user` ON `user`.id = jira_user.user_id LIMIT ?,?",
                values: [
                    offset,
                    limit,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                results.forEach(row => {
                    const jiraUser = new JiraUser();
                    jiraUser.id = row.id;

                    jiraUser.user = new User();
                    jiraUser.user.id = row.user_id;
                    jiraUser.user.email = row.email;

                    jiraUsers.push(jiraUser);
                })

                return resolve(jiraUsers);
            });

            connection.end();
        });
    }
}
