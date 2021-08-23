import {IsDateString, IsNotEmpty} from "class-validator";

export class PluralsightFlowCommentExtractionOptions {
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;
}