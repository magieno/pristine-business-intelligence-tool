import {IsDateString, IsNotEmpty} from "class-validator";

export class PluralsightFlowPullRequestExtractionOptions {
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;
}