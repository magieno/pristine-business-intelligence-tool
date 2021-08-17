import {User} from "./user.model";

export class Team {
    public id: string;

    public title: string;

    public teamMembers: User[] = [];
}