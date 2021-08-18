import {body, controller, queryParameter, route, routeParameter} from "@pristine-ts/networking";
import {injectable} from "tsyringe";
import {HttpMethod} from "@pristine-ts/common";
import {UserManager} from "../managers/user.manager";
import {TeamManager} from "../managers/team.manager";
import {bodyValidation} from "@pristine-ts/validation";
import {UserCreationOptions} from "../options/user-creation.options";
import {TeamCreationOptions} from "../options/team-creation.options";
import {TeamMemberCreationOptions} from "../options/team-member-creation.options";

@controller("/api/teams")
@injectable()
export class TeamController {
    public constructor(private readonly teamManager: TeamManager) {
    }

    @route(HttpMethod.Get, ":id")
    public get(@routeParameter("id") id: string) {
        return this.teamManager.get(id);
    }

    @route(HttpMethod.Get, "")
    public list(@queryParameter("limit") limit: number, @queryParameter("offset") offset: number) {
        return this.teamManager.list(offset ?? 0, limit ?? 100);
    }

    @route(HttpMethod.Post, "")
    @bodyValidation(TeamCreationOptions)
    public create(@body() teamCreationOptions: TeamCreationOptions) {
        return this.teamManager.create(teamCreationOptions);
    }

    @route(HttpMethod.Post, ":id/team-members")
    @bodyValidation(TeamMemberCreationOptions)
    public addTeamMember(@routeParameter("id") id: string, @body() options: TeamMemberCreationOptions) {
        return this.teamManager.addTeamMember(id, options);
    }

    @route(HttpMethod.Delete, ":id/team-members/:userId")
    public removeTeamMember(@routeParameter("id") id: string, @routeParameter("userId") userId: string) {
        return this.teamManager.removeTeamMember(id, userId);
    }
}