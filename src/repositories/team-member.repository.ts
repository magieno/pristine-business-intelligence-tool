import {inject, injectable} from "tsyringe";
import {User} from "../models/user.model";
import {BadRequestHttpError} from "@pristine-ts/networking";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import {Team} from "../models/team.model";
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class TeamMemberRepository {
    constructor(private readonly mysqlClient: MysqlClient, @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    public addTeamMember(teamId: string, userId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "INSERT INTO team_member(team_id, user_id) VALUES (?, ?)",
                values: [
                    teamId,
                    userId,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})

                    switch(error.code) {
                        case "ER_DUP_ENTRY":
                            return reject(new BadRequestHttpError("The team member is already part of this team.", [error]));
                    }
                }


                return resolve();
            });

            connection.end();
        })
    }

    public removeTeamMember(teamId: string, userId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "DELETE FROM team_member WHERE team_id = ? AND user_id = ?",
                values: [
                    teamId,
                    userId,
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
