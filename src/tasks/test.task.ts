import {ScheduledTaskInterface} from "@pristine-ts/scheduling";
import {inject, injectable} from "tsyringe";
import {ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";
import {LogHandlerInterface} from "@pristine-ts/logging";

@tag(ServiceDefinitionTagEnum.ScheduledTask)
@injectable()
export class TestTask implements ScheduledTaskInterface {
    constructor(@inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    run(): Promise<void> {
        this.logHandler.debug("Running test task.")
        return Promise.resolve();
    }
    
}