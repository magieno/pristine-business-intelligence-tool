import {IsEmail, IsInt, IsNotEmpty} from "class-validator";

export class PluralsightFlowUserAssociationOptions {
    @IsNotEmpty()
    @IsInt()
    apexUserId: number;
}
