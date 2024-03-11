import type { AggregateRoot } from "../aggregate/aggregate";
import { Event } from "./event";

export interface EventStore {
    loadEventStream(aggregateId: string): Promise<[Event[], string] | [[], null]>;

    // transaction to add new event in events stream, update aggregate version, and post event in outbox table
    appendEventsToStream(aggregate: AggregateRoot): Promise<void>;
}
