import {injectable} from "tsyringe";
import {body, controller, queryParameter, route, routeParameter} from "@pristine-ts/networking";
import {UserManager} from "../managers/user.manager";
import {HttpMethod} from "@pristine-ts/common";
import {bodyValidation} from "@pristine-ts/validation";
import {UserCreationOptions} from "../options/user-creation.options";
import {ExtractionRequestManager} from "../managers/extraction-request.manager";
import {ExtractionRequestOptions} from "../options/extraction-request.options";

@controller("/api/extraction-requests")
@injectable()
export class ExtractionRequestController {

    public constructor(private readonly extractionRequestManager: ExtractionRequestManager) {
    }

    @route(HttpMethod.Get, "")
    public list(@queryParameter("limit") limit: number, @queryParameter("offset") offset: number) {
        return this.extractionRequestManager.list(offset ?? 0, limit ?? 100);
    }

    @route(HttpMethod.Get, ":id")
    public get(@routeParameter("id") id: string) {
        return this.extractionRequestManager.get(id);
    }

    @route(HttpMethod.Post, "")
    @bodyValidation(ExtractionRequestOptions)
    public create(@body() extractionRequestOptions: ExtractionRequestOptions) {
        return this.extractionRequestManager.create(extractionRequestOptions);
    }

}