import {ExtractionServiceEnum} from "../enums/extraction-service.enum";
import {ExtractionRequestStatusEnum} from "../enums/extraction-request-status.enum";
import {IsArray, IsDate, IsEnum, MinLength} from "class-validator";

export class ExtractionRequestOptions {
    @IsArray()
    public userIds: string[] = [];

    @IsArray()
    public teamIds: string[] = [];

    @IsEnum(ExtractionServiceEnum)
    public service: ExtractionServiceEnum;

    @IsArray()
    public datapoints: string[] = [];

    @IsDate()
    public startDate: Date;

    @IsDate()
    public endDate: Date;
}