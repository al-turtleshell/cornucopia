import { v4 as uuid } from 'uuid';

abstract class Event {
    public readonly eventId: string;
    public readonly timestamp: Date;
    
    protected constructor() {
        this.eventId = uuid();
        this.timestamp = new Date();
    }
}

abstract class EventFailed extends Event {
    protected constructor(
        public readonly reason: string,
    ) {
        super();
    }
}

export { Event, EventFailed };