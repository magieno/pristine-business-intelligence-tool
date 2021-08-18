import {IsEmail, IsNotEmpty, IsUUID} from "class-validator";

export class PluralsightFlowUserAliasCreationOptions {
    @IsNotEmpty()
    userAliasId: string;
}
