import "reflect-metadata";
import {injectable} from "tsyringe";
import {UserRepository} from "../repositories/user.repository";
import {User} from "../models/user.model";
import {UserCreationOptions} from "../options/user-creation.options";
import {BadRequestHttpError} from "@pristine-ts/networking";
import {TeamRepository} from "../repositories/team.repository";
import {Team} from "../models/team.model";
import {TeamCreationOptions} from "../options/team-creation.options";
import {TeamMemberCreationOptions} from "../options/team-member-creation.options";
import {TeamMemberRepository} from "../repositories/team-member.repository";

@injectable()
export class TeamManager {
    constructor(private readonly teamRepository: TeamRepository, private readonly teamMemberRepository: TeamMemberRepository) {
    }

    list(offset = 0, limit = 100): Promise<Team[]> {
        return this.teamRepository.findAll(offset, limit);
    }

    async get(id: string): Promise<Team> {
        const team: Team | null = await this.teamRepository.get(id);

        if(team === null) {
            throw new BadRequestHttpError("The team with id: '" + id + "' wasn't found in the database.", []);
        }

        return team;
    }

    create(teamCreationOptions: TeamCreationOptions): Promise<Team> {
        return this.teamRepository.create(teamCreationOptions.name);
    }

    async addTeamMember(id: string, teamMemberCreationOptions: TeamMemberCreationOptions): Promise<Team> {
        await this.teamMemberRepository.addTeamMember(id, teamMemberCreationOptions.userId);

        return this.get(id);
    }

    async removeTeamMember(id: string, userId: string): Promise<Team> {
        await this.teamMemberRepository.removeTeamMember(id, userId);

        return this.get(id);
    }
}
