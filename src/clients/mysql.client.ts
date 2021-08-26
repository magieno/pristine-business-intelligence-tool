import {inject, injectable} from "tsyringe";
import mysql, {Connection} from "mysql";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

@injectable()
export class MysqlClient {
    constructor(@inject("%mysql.host%") private readonly host: string,
                @inject("%mysql.username%") private readonly username: string,
                @inject("%mysql.password%") private readonly password: string,
                @inject("%mysql.secret.arn%") private readonly secretArn: string,
                @inject("%mysql.database%") private readonly database: string) {
    }

    async getConnection(): Promise<Connection> {
        if(this.secretArn != "") {
            const client = new SecretsManagerClient({apiVersion: '2017-10-17'});
            const command = new GetSecretValueCommand({
                SecretId: this.secretArn,
            });
            const response = await client.send(command);

            if(response.SecretString === undefined) {
                throw new Error("Secret String is undefined.");
            }

            const secretString = JSON.parse(response.SecretString);

            return mysql.createConnection({
                host: this.host,
                user: secretString.username,
                password: secretString.password,
                database: this.database,
                ssl: { rejectUnauthorized: false},
            })
        }

        return mysql.createConnection({
            host: this.host,
            user: this.username,
            password: this.password,
            database: this.database,
        })
    }
}
