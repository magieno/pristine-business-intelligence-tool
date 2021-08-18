import {IsEmail, IsNotEmpty, IsUUID} from "class-validator";

export class TeamMemberCreationOptions {
    @IsNotEmpty()
    @IsUUID()
    userId: string;
}
