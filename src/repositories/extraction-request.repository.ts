import {inject, injectable} from "tsyringe";
import {MysqlClient} from "../clients/mysql.client";
import {LogHandlerInterface} from "@pristine-ts/logging";
import {BadRequestHttpError} from "@pristine-ts/networking";
import {ExtractionRequest} from "../models/extraction-request.model";
import {v4 as uuidv4} from 'uuid';
import {ExtractionServiceEnum} from "../enums/extraction-service.enum";
import {ExtractionRequestStatusEnum} from "../enums/extraction-request-status.enum";
import { format } from 'date-fns'

@injectable()
export class ExtractionRequestRepository {
    constructor(private readonly mysqlClient: MysqlClient, @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    public get(id: string): Promise<ExtractionRequest | null> {
        return new Promise<ExtractionRequest | null>(async (resolve, reject) => {

            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT * FROM extraction_request WHERE id = ?",
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
                const extractionRequest = new ExtractionRequest();
                extractionRequest.id = row.id;
                extractionRequest.userIds = JSON.parse(row.user_ids) || [];
                extractionRequest.teamIds = JSON.parse(row.team_ids) || [];
                extractionRequest.datapoints = JSON.parse(row.datapoints) || [];
                extractionRequest.service = row.service;
                extractionRequest.status = row.status;
                extractionRequest.completedExtractions = row.completed_extractions;
                extractionRequest.totalNumberOfExtractions = row.total_number_of_extractions;
                extractionRequest.startDate = new Date(row.start_date);
                extractionRequest.endDate = new Date(row.end_date);

                return resolve(extractionRequest);
            });

            connection.end();
        });
    }

    public findAll(offset: number = 0, limit: number = 100): Promise<ExtractionRequest[]> {
        return new Promise<ExtractionRequest[]>(async (resolve, reject) => {
            const extractionRequests: ExtractionRequest[] = [];

            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "SELECT * FROM extraction_request LIMIT ?,?",
                values: [
                    offset,
                    limit,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                results.forEach(row => {
                    const extractionRequest = new ExtractionRequest();
                    extractionRequest.id = row.id;
                    extractionRequest.userIds = JSON.parse(row.user_ids) || [];
                    extractionRequest.teamIds = JSON.parse(row.team_ids) || [];
                    extractionRequest.datapoints = JSON.parse(row.datapoints) || [];
                    extractionRequest.service = row.service;
                    extractionRequest.status = row.status;
                    extractionRequest.completedExtractions = row.completed_extractions;
                    extractionRequest.totalNumberOfExtractions = row.total_number_of_extractions;
                    extractionRequest.startDate = new Date(row.start_date);
                    extractionRequest.endDate = new Date(row.end_date);
                    extractionRequests.push(extractionRequest);
                })

                return resolve(extractionRequests);
            });

            connection.end();
        });
    }

    public create(service: ExtractionServiceEnum, datapoints: string[], teamIds: string[], userIds: string[], totalNumberOfExtractions: number, startDate: Date, endDate: Date): Promise<ExtractionRequest> {
        return new Promise<ExtractionRequest>(async (resolve, reject) => {
            const extractionRequest = new ExtractionRequest();
            extractionRequest.id = uuidv4();
            extractionRequest.status = ExtractionRequestStatusEnum.InProgress;
            extractionRequest.service = service;
            extractionRequest.datapoints = datapoints;
            extractionRequest.teamIds = teamIds;
            extractionRequest.userIds = userIds;
            extractionRequest.totalNumberOfExtractions = totalNumberOfExtractions;
            extractionRequest.completedExtractions = 0;
            extractionRequest.startDate = startDate;
            extractionRequest.endDate = endDate;

            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "INSERT INTO extraction_request (id, user_ids, team_ids, service, datapoints, status, total_number_of_extractions, completed_extractions, start_date, end_date) VALUES (?,?,?,?,?,?,?,?,?,?)",
                values: [
                    extractionRequest.id,
                    JSON.stringify(extractionRequest.userIds),
                    JSON.stringify(extractionRequest.teamIds),
                    extractionRequest.service,
                    JSON.stringify(extractionRequest.datapoints),
                    extractionRequest.status,
                    extractionRequest.totalNumberOfExtractions,
                    extractionRequest.completedExtractions,
                    format(extractionRequest.startDate, "yyyy-MM-dd"),
                    format(extractionRequest.endDate, "yyyy-MM-dd"),
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})

                    switch(error.code) {
                        case "ER_DUP_ENTRY":
                            return reject(new BadRequestHttpError("There is already an extraction request for this id", [error]));
                    }
                }

                return resolve(extractionRequest);
            });

            connection.end();
        })

    }

    public updateStatus(id: string, status: ExtractionRequestStatusEnum): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "UPDATE extraction_request SET status = ? WHERE id = ?",
                values: [
                    status,
                    id,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                return resolve();
            });

            connection.end();
        });
    }

    public incrementCompletedExtractions(id: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const connection = await this.mysqlClient.getConnection();

            connection.connect();

            connection.query({
                sql: "UPDATE extraction_request SET completed_extractions = completed_extractions + 1 WHERE id = ?",
                values: [
                    id,
                ],
            }, (error, results, fields) => {
                if (error) {
                    this.logHandler.error("Mysql error" + error?.message + " - " + error?.sql, {error})
                }

                return resolve();
            });

            connection.end();
        });
    }
}