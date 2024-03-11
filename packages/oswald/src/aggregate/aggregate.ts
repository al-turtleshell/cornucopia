
import type { Command } from "../command/command";
import { Event } from "../event/event";
import { loadEventStream } from "../store/functions/load-event-stream";

abstract class AggregateRoot {
    protected _id: string | null = null;
    protected _version: string | null = null;

    private _history: Event[] = [];
    private _changes: Event[] = [];
    protected _loadEventStream = loadEventStream;

    get id(): string {
        if (this._id === null) {
            throw new Error("Aggregate root not initialized");
        }

        return this._id;
    }

    get version(): string | null {
        return this._version;
    }

    get history(): Event[] {
        return this._history;
    }

    async apply(event: Event, isNew: boolean = true): Promise<void> {
        const handler = this.getEventHandler(event);
        
        if (handler) {
            await handler.call(this, event);
        }

        if (isNew) {
            this._changes.push(event);
        } else {
            this._history.push(event);
        }
    }

    async execute(command: Command): Promise<void> {
        const handler = this.getCommandHandler(command);

        if (handler) {
            const event = await handler.call(this, command);
            await this.apply(event, true);
            return;
        }

        throw new Error("Command handler not found for " + command.constructor.name);
    }


    getUncommittedChanges(): Event[] {
        return this._changes;
    }

    markChangesAsCommitted(newVersion: string): void {
        this._history = [...this._history,...this._changes];
        this._changes = [];
        this._version = newVersion;
    }

    async loadFromHistory(history: Event[], id: string, version: string): Promise<void> {

        for(let i = 0; i < history.length; i++) {
            await this.apply(history[i], false)
        }
        
        this._version = version;
        this._id = id;
    }

    private getEventHandler(event: Event): Function | undefined {
        const handlerName = `on${event.constructor.name}`;
        const handler = (this as any)[handlerName];
        return typeof handler === 'function' ? handler : undefined;
    }

    private getCommandHandler(command: any): Function | undefined {
        const commandName = command.constructor.name.charAt(0).toLowerCase() + command.constructor.name.slice(1);
        
        const handler = (this as any)[commandName];
        return typeof handler === 'function' ? handler : undefined;
    }

    protected async rehydrateEntity<T extends AggregateRoot>(entity: T, entityId: string): Promise<T> {
        const [events, version] = await this._loadEventStream(entityId);
        if (events.length === 0) {
            throw new Error(`No events found for ${entity.constructor.name} with id: ${entityId}`);    
        }

       
        await entity.loadFromHistory(events, entityId, version as string);
        return entity;
    }

}

export { AggregateRoot }