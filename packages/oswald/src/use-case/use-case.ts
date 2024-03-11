import type { AggregateRoot } from "../aggregate/aggregate";
import type { Command } from "../command/command";
import { AggregateMissingError } from "../error/AggregateMissingError";
import { AggregateVersionMismatchError } from "../error/AggregateVersionMismatchError";
import type { EventStore } from "../event/event-store";

abstract class UseCase {
    protected _eventStore: EventStore;
    protected _aggregate: AggregateRoot;
    protected _command: Command;

    protected constructor(
        aggregate: AggregateRoot,
        command: Command,
        eventStore: EventStore
    ) {
        this._eventStore = eventStore;
        this._aggregate = aggregate;
        this._command = command;
    }

    public async run(): Promise<void> {
        // eslint-disable-next-line no-useless-catch
        try {
            await this._command.validate();

            const aggregateId = this._command.aggregateId;

            if (aggregateId) {
                const [events, version] = await this._eventStore.loadEventStream(aggregateId);
                if (events.length === 0) {
                    throw new AggregateMissingError(this._aggregate.constructor.name, aggregateId) 
                }
       
                await this._aggregate.loadFromHistory(events, aggregateId, version as string);
                
                if (this._command.aggregateVersion !== this._aggregate.version) {
                    throw new AggregateVersionMismatchError(this._aggregate.constructor.name, aggregateId, this._command.aggregateVersion as string, this._aggregate.version as string);
                }
            }
            
            await this._aggregate.execute(this._command);
            
            await this._eventStore.appendEventsToStream(this._aggregate);
        } catch (e) {
            throw e;
        }
    }
}

export { UseCase };