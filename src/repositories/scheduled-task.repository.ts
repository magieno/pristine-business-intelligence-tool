import {inject, injectable} from "tsyringe";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import {ScheduledTask} from "../models/scheduled-task.model";

@injectable()
export class ScheduledTaskRepository {
    constructor(private readonly mysqlClient: MysqlClient,
                @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    getLastScheduledTask(taskName: string): Promise<ScheduledTask | null> {
        return new Promise<ScheduledTask | null>(async resolve => {
            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT task_name, last_run_at FROM scheduled_task WHERE task_name = ?",
                values: [
                    taskName,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                if (results.length === 0) {
                    return resolve(null);
                }

                const scheduledTask = new ScheduledTask();
                scheduledTask.taskName = results[0].task_name;
                scheduledTask.lastRunAt = new Date(results[0].last_run_at)

                return resolve(scheduledTask);
            });
        });
    }

    completeTaskExecution(taskName: string): Promise<void> {
        return new Promise<void>(async resolve => {
            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            const lastRunAt = new Date();

            connection.query({
                sql: "INSERT INTO scheduled_task(task_name, last_run_at) VALUES (?, ?) ON DUPLICATE KEY UPDATE " +
                    "task_name = ?," +
                    "last_run_at = ?",
                values: [
                    taskName,
                    lastRunAt,
                    taskName,
                    lastRunAt,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                return resolve();
            });
        })
    }
}
