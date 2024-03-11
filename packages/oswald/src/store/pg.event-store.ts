import { appendEventsToStream } from "./functions/append-events-to-stream"
import { loadEventStream } from "./functions/load-event-stream"


const PgEventStore = {
    loadEventStream,
    appendEventsToStream
}

export { PgEventStore }