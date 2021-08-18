import {IsEmail, IsNotEmpty} from "class-validator";

export class PluralsightFlowUserAssociationOptions {
    @IsNotEmpty()
    apexUserId: string;
}
