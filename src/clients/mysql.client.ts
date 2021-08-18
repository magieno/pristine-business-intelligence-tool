import {inject, injectable} from "tsyringe";
import mysql, {Connection} from "mysql";

@injectable()
export class MysqlClient {
    constructor(@inject("%mysql.host%") private readonly host: string,
                @inject("%mysql.user%") private readonly user: string,
                @inject("%mysql.password%") private readonly password: string,
                @inject("%mysql.database%") private readonly database: string) {
    }

    getConnection(): Connection {
        return mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database,
        })
    }
}
