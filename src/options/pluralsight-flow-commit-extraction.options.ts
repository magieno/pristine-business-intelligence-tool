import {IsDateString, IsNotEmpty} from "class-validator";

export class PluralsightFlowCommitExtractionOptions {
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;
}