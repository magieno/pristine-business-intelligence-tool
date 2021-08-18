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
        return new Promise<JiraUser>((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

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
}
