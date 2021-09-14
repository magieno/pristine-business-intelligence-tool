import {ScheduledTaskInterface} from "@pristine-ts/scheduling";
import {ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";
import {inject, injectable} from "tsyringe";
import {LogHandlerInterface} from "@pristine-ts/logging";
import {ScheduledTaskRepository} from "../repositories/scheduled-task.repository";

@tag(ServiceDefinitionTagEnum.ScheduledTask)
@injectable()
export class PluralsightFlowAliasRetrieverTask implements ScheduledTaskInterface {
    private readonly taskAlias = "pluralsight-flow-alias-retriever";

    constructor(@inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface,
                private readonly scheduledTaskRepository: ScheduledTaskRepository) {
    }

    async run(): Promise<void> {
        const lastScheduledTask = await this.scheduledTaskRepository.getLastScheduledTask(this.taskAlias)

        const currentTime = new Date();

        if(lastScheduledTask && (+currentTime - +lastScheduledTask.lastRunAt) < 24*60*601000) {
            this.logHandler.debug("Skipping this scheduled task since it ran less than 24 hours ago", {lastScheduledTask})
            return;
        }

        this.logHandler.debug("Running Pluralsight flow alias retriever task.")

        await this.scheduledTaskRepository.completeTaskExecution(this.taskAlias);

        this.logHandler.debug("Completed running pluralsight flow alias retriever task.")

        return Promise.resolve();
    }

}
