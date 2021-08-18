import "reflect-metadata";
import {injectable} from "tsyringe";
import {UserRepository} from "../repositories/user.repository";
import {User} from "../models/user.model";
import {UserCreationOptions} from "../options/user-creation.options";
import {BadRequestHttpError} from "@pristine-ts/networking";

@injectable()
export class UserManager {
    constructor(private readonly userRepository: UserRepository) {
    }

    list(offset = 0, limit = 100): Promise<User[]> {
        return this.userRepository.findAll(offset, limit);
    }

    async get(id: string): Promise<User> {
        const user: User | null = await this.userRepository.get(id);

        if(user === null) {
            throw new BadRequestHttpError("The user with id: '" + id + "' wasn't found in the database.", []);
        }

        return user;
    }

    create(userCreationOptions: UserCreationOptions): Promise<User> {
        return this.userRepository.create(userCreationOptions.email);
    }
}
