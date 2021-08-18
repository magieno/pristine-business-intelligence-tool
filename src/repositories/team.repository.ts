import {inject, injectable} from "tsyringe";
import {User} from "../models/user.model";
import {BadRequestHttpError} from "@pristine-ts/networking";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import {Team} from "../models/team.model";
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class TeamRepository {
    constructor(private readonly mysqlClient: MysqlClient, @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    public get(id: string): Promise<Team | null> {
        return new Promise<Team | null>((resolve, reject) => {

            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT team.id, team.name FROM team WHERE team.id = ?",
                values: [
                    id,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                if(results.length === 0) {
                    return resolve(null);
                }

                const team = new Team();
                team.id = results[0].id;
                team.name = results[0].name;
                team.teamMembers = [];

                connection.query({
                    sql: "SELECT user.id AS user_id, user.email FROM user " +
                        "INNER JOIN team_member ON user.id = team_member.user_id " +
                        "WHERE team_member.team_id = ?",
                    values: [
                        id,
                    ]
                }, (error, results, fields) => {
                    if (error) {
                        this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                    }

                    if(results.length === 0) {
                        return resolve(team);
                    }

                    results.forEach(row => {
                        const user = new User();
                        user.id = row.user_id;
                        user.email = row.email;

                        // @ts-ignore
                        team.teamMembers.push(user);
                    })

                    return resolve(team);
                })

                connection.end();
            });
        });
    }

    public findAll(offset: number = 0, limit: number = 100): Promise<Team[]> {
        return new Promise<Team[]>((resolve, reject) => {

            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT team.id, team.name FROM team LIMIT ?,?",
                values: [
                    offset,
                    limit,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                const teams: Team[] = [];

                results.forEach(row => {
                    const team = new Team();
                    team.id = results[0].id;
                    team.name = results[0].name;
                    team.teamMembers = undefined;

                    teams.push(team);
                });

                return resolve(teams);
            });

            connection.end();
        });
    }

    public create(name: string): Promise<Team> {
        return new Promise((resolve, reject) => {
            const team = new Team();
            team.id = uuidv4();
            team.name = name;

            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "INSERT INTO team (id, name) VALUES (?,?)",
                values: [
                    team.id,
                    team.name,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                return resolve(team);
            });

            connection.end();
        })

    }
}
