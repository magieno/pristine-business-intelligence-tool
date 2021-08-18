import {injectable} from "tsyringe";
import {JiraUserAssociationOptions} from "../options/jira-user-association.options";
import {JiraUser} from "../models/jira-user.model";
import {JiraUserRepository} from "../repositories/jira-user.repository";
import {UserRepository} from "../repositories/user.repository";
import {UserManager} from "./user.manager";
import {User} from "../models/user.model";
import {BadRequestHttpError} from "@pristine-ts/networking";
import {PluralsightFlowUserRepository} from "../repositories/pluralsight-flow-user.repository";
import {PluralsightFlowUser} from "../models/pluralsight-flow-user.model";
import {PluralsightFlowUserAssociationOptions} from "../options/pluralsight-flow-user-association.options";
import {PluralsightFlowUserAliasCreationOptions} from "../options/pluralsight-flow-user-alias-creation.options";

@injectable()
export class PluralsightFlowManager {
    constructor(private readonly pluralsightFlowUserRepository: PluralsightFlowUserRepository, private readonly userManager: UserManager) {
    }

    list(offset = 0, limit = 100): Promise<PluralsightFlowUser[]> {
        return this.pluralsightFlowUserRepository.findAll(offset, limit);
    }

    async get(apexUserId: string): Promise<PluralsightFlowUser> {
        const pluralsightFlowUser: PluralsightFlowUser | null = await this.pluralsightFlowUserRepository.get(apexUserId);

        if(pluralsightFlowUser === null) {
            throw new BadRequestHttpError("The pluralsight flow user with apex user id: '" + apexUserId + "' wasn't found in the database.", []);
        }

        return pluralsightFlowUser;
    }

    public async associate(userId: string, options: PluralsightFlowUserAssociationOptions): Promise<PluralsightFlowUser> {
        const user = await this.userManager.get(userId);

        const jiraUser = await this.pluralsightFlowUserRepository.createOrUpdate(options.apexUserId, userId);
        jiraUser.user = user;

        return jiraUser;
    }

    public async addUserAlias(apexUserId: string, options: PluralsightFlowUserAliasCreationOptions): Promise<PluralsightFlowUser> {
        await this.pluralsightFlowUserRepository.addUserAlias(apexUserId, options.userAliasId);
        return this.get(apexUserId);
    }

    public async removeUserAlias(apexUserId: string, aliasUserId: string): Promise<void> {
        await this.pluralsightFlowUserRepository.removeUserAlias(apexUserId, aliasUserId);
    }
}
