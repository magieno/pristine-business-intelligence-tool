import {inject, injectable} from "tsyringe";
import {User} from "../models/user.model";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import { v4 as uuidv4 } from 'uuid';
import {BadRequestHttpError} from "@pristine-ts/networking";

@injectable()
export class UserRepository {
    constructor(private readonly mysqlClient: MysqlClient, @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    public get(id: string): Promise<User | null> {
        return new Promise<User | null>((resolve, reject) => {

            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT * FROM user WHERE id = ?",
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
                const user = new User();
                user.id = row.id;
                user.email = row.email;

                return resolve(user);
            });

            connection.end();
        });
    }

    public findAll(offset: number = 0, limit: number = 100): Promise<User[]> {
        return new Promise<User[]>((resolve, reject) => {
            const users: User[] = [];

            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT * FROM user LIMIT ?,?",
                values: [
                    offset,
                    limit,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                results.forEach(row => {
                    const user = new User();
                    user.id = row.id;
                    user.email = row.email;

                    users.push(user);
                })

                return resolve(users);
            });

            connection.end();
        });
    }

    public create(email: string): Promise<User> {
        return new Promise((resolve, reject) => {
            const user = new User();
            user.email = email;
            user.id = uuidv4();

            const connection = this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "INSERT INTO user (id, email) VALUES (?,?)",
                values: [
                    user.id,
                    user.email,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})

                    switch(error.code) {
                        case "ER_DUP_ENTRY":
                            return reject(new BadRequestHttpError("There is already a user for this email address", [error]));
                    }
                }

                return resolve(user);
            });

            connection.end();
        })

    }
}
