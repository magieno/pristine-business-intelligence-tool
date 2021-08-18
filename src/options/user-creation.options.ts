import {IsEmail, IsNotEmpty} from "class-validator";

export class UserCreationOptions {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
