import "reflect-metadata";
import {body, controller, queryParameter, route, routeParameter} from "@pristine-ts/networking";
import {UserManager} from "../managers/user.manager";
import {HttpMethod} from "@pristine-ts/common";
import {injectable} from "tsyringe";
import {bodyValidation} from "@pristine-ts/validation";
import {UserCreationOptions} from "../options/user-creation.options";


@controller("/api/users")
@injectable()
export class UserController {
    public constructor(private readonly userManager: UserManager) {
    }

    @route(HttpMethod.Get, "")
    public list(@queryParameter("limit") limit: number, @queryParameter("offset") offset: number) {
        return this.userManager.list(offset ?? 0, limit ?? 100);
    }

    @route(HttpMethod.Get, ":id")
    public get(@routeParameter("id") id: string) {
        return this.userManager.get(id);
    }

    @route(HttpMethod.Post, "")
    @bodyValidation(UserCreationOptions)
    public create(@body() userCreationOptions: UserCreationOptions) {
        return this.userManager.create(userCreationOptions);
    }
}
