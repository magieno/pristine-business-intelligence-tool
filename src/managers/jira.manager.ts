import {injectable} from "tsyringe";
import {JiraUserAssociationOptions} from "../options/jira-user-association.options";
import {JiraUser} from "../models/jira-user.model";
import {JiraUserRepository} from "../repositories/jira-user.repository";
import {UserRepository} from "../repositories/user.repository";
import {UserManager} from "./user.manager";

@injectable()
export class JiraManager {
    constructor(private readonly jiraUserRepository: JiraUserRepository, private readonly userManager: UserManager) {
    }

    public async associate(userId: string, jiraUserAssociationOptions: JiraUserAssociationOptions): Promise<JiraUser> {
        const user = await this.userManager.get(userId);

        const jiraUser = await this.jiraUserRepository.createOrUpdate(jiraUserAssociationOptions.id, userId);
        jiraUser.user = user;

        return jiraUser;
    }
}
