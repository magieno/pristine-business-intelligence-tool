export class PluralsightFlowPullRequestModel {
    id: number;
    title: string;
    url: string;
    reviewerUserAliasIds: number[];
    createdAt: Date;
    apexUserId: number;
    mergedByUserAliasId: number;
    numberOfCommits: number;
    startedAt: Date;
    endedAt?: Date;
    codingTime?: number;
    reviewTime?: number;
    firstCommentAt?: Date
}