import {injectable} from "tsyringe";
import {ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";
import {Event, EventListenerInterface} from "@pristine-ts/event";

@tag(ServiceDefinitionTagEnum.EventListener)
@injectable()
export class ExtractionRequestListener implements EventListenerInterface {
    handle<T>(event: Event<T>): Promise<void> {
        return Promise.resolve(undefined);
    }

    supports<T>(event: Event<T>): boolean {
        return false;
    }

}