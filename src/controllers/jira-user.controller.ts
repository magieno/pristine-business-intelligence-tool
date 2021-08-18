import {body, controller, route, routeParameter} from "@pristine-ts/networking";
import {HttpMethod} from "@pristine-ts/common";
import {bodyValidation} from "@pristine-ts/validation";
import {UserCreationOptions} from "../options/user-creation.options";
import {JiraUserAssociationOptions} from "../options/jira-user-association.options";
import {injectable} from "tsyringe";
import {JiraManager} from "../managers/jira.manager";

@controller("/api")
@injectable()
export class JiraUserController {
    constructor(private readonly jiraManager: JiraManager) {
    }

    @route(HttpMethod.Post, "/users/:id/jira-user")
    @bodyValidation(JiraUserAssociationOptions)
    public associateJiraUser(@routeParameter("id")userId: string, @body() options: JiraUserAssociationOptions) {
        return this.jiraManager.associate(userId, options);
    }
}
