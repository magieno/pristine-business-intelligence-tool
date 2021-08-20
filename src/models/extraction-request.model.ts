import {ExtractionServiceEnum} from "../enums/extraction-service.enum";
import {ExtractionRequestStatusEnum} from "../enums/extraction-request-status.enum";

export class ExtractionRequest {
    public id: string;

    public userIds: string[];

    public teamIds: string[];

    public service: ExtractionServiceEnum;

    public datapoints: string[];

    public status: ExtractionRequestStatusEnum;

    public totalNumberOfExtractions: number = 0;

    public completedExtractions: number = 0;

    public startDate: Date;

    public endDate: Date;
}