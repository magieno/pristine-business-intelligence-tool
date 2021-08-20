import {injectable} from "tsyringe";
import {ExtractionRequestRepository} from "../repositories/extraction-request.repository";
import {User} from "../models/user.model";
import {BadRequestHttpError} from "@pristine-ts/networking";
import {UserCreationOptions} from "../options/user-creation.options";
import {ExtractionRequestOptions} from "../options/extraction-request.options";
import {ExtractionServiceEnum} from "../enums/extraction-service.enum";
import {ExtractionRequest} from "../models/extraction-request.model";


@injectable()
export class ExtractionRequestManager {
    constructor(private readonly extractionRequestRepository: ExtractionRequestRepository) {
    }


    list(offset = 0, limit = 100): Promise<ExtractionRequest[]> {
        return this.extractionRequestRepository.findAll(offset, limit);
    }

    async get(id: string): Promise<ExtractionRequest> {
        const extractionRequest: ExtractionRequest | null = await this.extractionRequestRepository.get(id);

        if(extractionRequest === null) {
            throw new BadRequestHttpError("The extraction request with id: '" + id + "' wasn't found in the database.", []);
        }

        return extractionRequest;
    }

    create(options: ExtractionRequestOptions): Promise<ExtractionRequest> {
        const totalNumberOfExtractions = 500;

        // Calculate how many extractions we will have.



        return this.extractionRequestRepository.create(options.service, options.datapoints, options.teamIds, options.userIds, totalNumberOfExtractions, options.startDate, options.endDate);
    }
}