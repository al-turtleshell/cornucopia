import { v4 as uuid } from 'uuid';
import { CommandValidationError } from '../error/CommandValidationError';
import { Event } from '../event/event';

abstract class Command {
    public readonly id: string;
    public readonly timestamp: Date;
    public readonly aggregateId: string | null;
    public readonly aggregateVersion: string | null;

    protected constructor(aggregateId: string | null = null, aggregateVersion: string | null = null) {
        this.id = uuid();
        this.timestamp = new Date();
        this.aggregateId = aggregateId;
        this.aggregateVersion = aggregateVersion;

    }

    abstract execute(): Promise<Event>;
    protected async constraints(): Promise<void> {}
    
    public async validate(): Promise<void> {
        this.ensure();
        await this.constraints();
    }

    protected ensure() {
        if (this.aggregateId && !this.aggregateVersion) { 
            throw new CommandValidationError(this.constructor.name, 'Aggregate version must be provided when aggregate id is provided');
        }

        if (!this.aggregateId && this.aggregateVersion) {
            throw new CommandValidationError(this.constructor.name, 'Aggregate id must be provided when aggregate version is provided');
        }
    }
}


export { Command };
