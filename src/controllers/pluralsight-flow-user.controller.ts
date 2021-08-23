import {body, controller, queryParameter, route, routeParameter} from "@pristine-ts/networking";
import {HttpMethod} from "@pristine-ts/common";
import {bodyValidation} from "@pristine-ts/validation";
import {UserCreationOptions} from "../options/user-creation.options";
import {JiraUserAssociationOptions} from "../options/jira-user-association.options";
import {injectable} from "tsyringe";
import {JiraManager} from "../managers/jira.manager";
import {PluralsightFlowManager} from "../managers/pluralsight-flow.manager";
import {PluralsightFlowUserAssociationOptions} from "../options/pluralsight-flow-user-association.options";
import {PluralsightFlowUserAliasCreationOptions} from "../options/pluralsight-flow-user-alias-creation.options";
import {PluralsightFlowPullRequestExtractionOptions} from "../options/pluralsight-flow-pull-request-extraction.options";

@controller("/api")
@injectable()
export class PluralsightFlowUserController {
    constructor(private readonly pluralsightFlowManager: PluralsightFlowManager) {
    }

    @route(HttpMethod.Get, "/pluralsight-flow-users/:id")
    public get(@routeParameter("id") id: string) {
        return this.pluralsightFlowManager.get(id);
    }

    @route(HttpMethod.Get, "/pluralsight-flow-users")
    public list(@queryParameter("limit") limit: number, @queryParameter("offset") offset: number) {
        return this.pluralsightFlowManager.list(offset ?? 0, limit ?? 100);
    }

    @route(HttpMethod.Post, "/users/:id/pluralsight-flow-user")
    @bodyValidation(PluralsightFlowUserAssociationOptions)
    public associateJiraUser(@routeParameter("id") userId: string, @body() options: PluralsightFlowUserAssociationOptions) {
        return this.pluralsightFlowManager.associate(userId, options);
    }

    @route(HttpMethod.Post, "/pluralsight-flow-users/:id/aliases")
    @bodyValidation(PluralsightFlowUserAliasCreationOptions)
    public addAlias(@routeParameter("id") id: string, @body() options: PluralsightFlowUserAliasCreationOptions) {
        return this.pluralsightFlowManager.addUserAlias(id, options);
    }

    @route(HttpMethod.Delete, "/pluralsight-flow-users/:id/aliases/:aliasId")
    public removeAlias(@routeParameter("id") id: string, @routeParameter("aliasId") aliasId: string) {
        return this.pluralsightFlowManager.removeUserAlias(id, aliasId);
    }


    @route(HttpMethod.Post, "/users/:id/extract/pull-requests")
    @bodyValidation(PluralsightFlowPullRequestExtractionOptions)
    public extractPullRequests(@routeParameter("id") id: string, @body() options: PluralsightFlowPullRequestExtractionOptions) {
        // Convert dates to a date object
        const startDate = new Date(options.startDate);
        const endDate = new Date(options.endDate);

        return this.pluralsightFlowManager.fetchAndSavePullRequest(id, startDate, endDate);
    }
}
