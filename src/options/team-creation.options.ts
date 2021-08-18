import {IsEmail, IsNotEmpty} from "class-validator";

export class TeamCreationOptions {
    @IsNotEmpty()
    name: string;
}
