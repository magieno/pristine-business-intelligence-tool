import {IsEmail, IsInt, IsNotEmpty, IsUUID} from "class-validator";

export class PluralsightFlowUserAliasCreationOptions {
    @IsNotEmpty()
    @IsInt()
    userAliasId: number;
}
