import {inject, injectable} from "tsyringe";
import {UserManager} from "./user.manager";
import {BadRequestHttpError} from "@pristine-ts/networking";
import {PluralsightFlowUserRepository} from "../repositories/pluralsight-flow-user.repository";
import {PluralsightFlowUser} from "../models/pluralsight-flow-user.model";
import {PluralsightFlowUserAssociationOptions} from "../options/pluralsight-flow-user-association.options";
import {PluralsightFlowUserAliasCreationOptions} from "../options/pluralsight-flow-user-alias-creation.options";
import {HttpClientInterface, HttpRequestInterface, HttpRequestOptions} from "@pristine-ts/http";
import {HttpMethod} from "@pristine-ts/common";
import {LogHandlerInterface} from "@pristine-ts/logging";
import {add, format} from 'date-fns'
import {ExtractionRequestRepository} from "../repositories/extraction-request.repository";
import {PluralsightFlowPullRequestModel} from "../models/pluralsight-flow-pull-request.model";

@injectable()
export class PluralsightFlowManager {
    constructor(private readonly pluralsightFlowUserRepository: PluralsightFlowUserRepository,
                private readonly extractionRequestRepository: ExtractionRequestRepository,
                private readonly userManager: UserManager,
                @inject("HttpClientInterface") private readonly httpClient: HttpClientInterface,
                @inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface,
                @inject("%pluralsight-flow.api-key%") private readonly apiKey: string) {
    }

    list(offset = 0, limit = 100): Promise<PluralsightFlowUser[]> {
        return this.pluralsightFlowUserRepository.findAll(offset, limit);
    }

    async get(apexUserId: string): Promise<PluralsightFlowUser> {
        const pluralsightFlowUser: PluralsightFlowUser | null = await this.pluralsightFlowUserRepository.get(apexUserId);

        if (pluralsightFlowUser === null) {
            throw new BadRequestHttpError("The pluralsight flow user with apex user id: '" + apexUserId + "' wasn't found in the database.", []);
        }

        return pluralsightFlowUser;
    }

    async getFromUserId(userId: string): Promise<PluralsightFlowUser> {
        const pluralsightFlowUser: PluralsightFlowUser | null = await this.pluralsightFlowUserRepository.getFromUserId(userId);

        if (pluralsightFlowUser === null) {
            throw new BadRequestHttpError("The pluralsight flow user for user with id: '" + userId + "' wasn't found in the database.", []);
        }

        return pluralsightFlowUser;
    }

    public async associate(userId: string, options: PluralsightFlowUserAssociationOptions): Promise<PluralsightFlowUser> {
        const user = await this.userManager.get(userId);

        const pluralsightFlowUser = await this.pluralsightFlowUserRepository.createOrUpdate(options.apexUserId, userId);
        pluralsightFlowUser.user = user;

        return pluralsightFlowUser;
    }

    public async addUserAlias(apexUserId: string, options: PluralsightFlowUserAliasCreationOptions): Promise<PluralsightFlowUser> {
        await this.pluralsightFlowUserRepository.addUserAlias(apexUserId, options.userAliasId);
        return this.get(apexUserId);
    }

    public async removeUserAlias(apexUserId: string, aliasUserId: string): Promise<void> {
        await this.pluralsightFlowUserRepository.removeUserAlias(apexUserId, aliasUserId);
    }

    public async fetchAndSavePullRequest(userId: string, startDate: Date, endDate: Date, extractionRequestId?: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Verify that StartDate cannot be bigger than end date.
            if (startDate > endDate) {
                this.logHandler.error("Start date bigger than end date - Start date: " + format(startDate, "yyyy-MM-dd") + " - End Date: " + format(endDate, "yyyy-MM-dd"));
                return reject();
            }

            // Retrieve the ApexUserId from the userId.
            const pluralsightFlowUser = await this.getFromUserId(userId);

            // Make the Request to PluralsightFlow
            const requestOptions: HttpRequestOptions = {
                isRetryable: (httpRequest, httpResponse) => {
                    this.logHandler.error("Retrying");
                    return httpResponse.status >= 500;
                },
                maximumNumberOfRetries: 3,
            };

            const limit = 1000;
            const offset = 0;

            const httpRequest: HttpRequestInterface = {
                url: "https://flow.pluralsight.com/v3/customer/core/pull_requests/?limit=" + limit + "&offset=" + offset + "&author_date__gte=" + format(startDate, "yyyy-MM-dd") + "&author_date__lte=" + format(add(startDate, {days: 5}), "yyyy-MM-dd") + "&apex_user_id=" + pluralsightFlowUser.apexUserId + "&ordering=author_date",
                httpMethod: HttpMethod.Get,
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + this.apiKey,
                    "Content-Type": "application/json",
                }
            }

            const httpResponse = await this.httpClient.request(httpRequest, requestOptions);

            // Loop over the pull requests
            const body = JSON.parse(httpResponse.body);

            if (body === undefined || body.results === undefined || Array.isArray(body.results) === false) {
                this.logHandler.error("Body is undefined or results is undefined or results is not an array.");
                return reject();
            }

            // Save the pull requests
            const pullRequestsToSave: PluralsightFlowPullRequestModel[] = body.results.map(result => {
                const pullRequest: PluralsightFlowPullRequestModel = {
                    id: parseInt(result.id),
                    title: result.title,
                    url: result.url,
                    createdAt: new Date(result.created_at),
                    apexUserId: pluralsightFlowUser.apexUserId,
                    mergedByUserAliasId: result.merged_by_id,
                    numberOfCommits: parseInt(result.number),
                    startedAt: new Date(result.pr_start),
                    endedAt: result.pr_end ? new Date(result.pr_end): undefined,
                    codingTime: result.coding_time,
                    reviewTime: result.review_time,
                    firstCommentAt: result.first_comment_at ? new Date(result.first_comment_at) : undefined,
                };

                return pullRequest;
            });

            await this.pluralsightFlowUserRepository.savePullRequests(pullRequestsToSave);

            // Update the extraction request if there was one.
            if(extractionRequestId) {
                await this.extractionRequestRepository.incrementCompletedExtractions(extractionRequestId);
            }

            return resolve();
        })
    }
}
