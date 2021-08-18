import {injectable} from "tsyringe";
import {JiraUserAssociationOptions} from "../options/jira-user-association.options";
import {JiraUser} from "../models/jira-user.model";
import {JiraUserRepository} from "../repositories/jira-user.repository";
import {UserRepository} from "../repositories/user.repository";
import {UserManager} from "./user.manager";
import {User} from "../models/user.model";
import {BadRequestHttpError} from "@pristine-ts/networking";

@injectable()
export class JiraManager {
    constructor(private readonly jiraUserRepository: JiraUserRepository, private readonly userManager: UserManager) {
    }

    list(offset = 0, limit = 100): Promise<JiraUser[]> {
        return this.jiraUserRepository.findAll(offset, limit);
    }

    async get(id: string): Promise<JiraUser> {
        const jiraUser: JiraUser | null = await this.jiraUserRepository.get(id);

        if(jiraUser === null) {
            throw new BadRequestHttpError("The jira user with id: '" + id + "' wasn't found in the database.", []);
        }

        return jiraUser;
    }

    public async associate(userId: string, jiraUserAssociationOptions: JiraUserAssociationOptions): Promise<JiraUser> {
        const user = await this.userManager.get(userId);

        const jiraUser = await this.jiraUserRepository.createOrUpdate(jiraUserAssociationOptions.id, userId);
        jiraUser.user = user;

        return jiraUser;
    }
}
