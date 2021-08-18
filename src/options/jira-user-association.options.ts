import {IsEmail, IsNotEmpty} from "class-validator";

export class JiraUserAssociationOptions {
    @IsNotEmpty()
    id: string;
}
