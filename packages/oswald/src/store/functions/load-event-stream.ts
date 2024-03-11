import { EventCodec } from "../../event/event-codec";
import { Event } from "../../event/event";
import prisma from "../prisma";



async function loadEventStream(aggregateId: string): Promise<[Event[], string] | [[], null]> {

    const events = await prisma.eventStore.findMany({
        where: {
                aggregateId: aggregateId,
        }
    });

    if (events.length === 0) {
        return [[], null];
    }

    const aggregate = await prisma.aggregateVersion.findUnique({
        where: {
            aggregateId: aggregateId
        }
    });

    if (!aggregate) {
        throw new Error("EVENTS FOUND BUT NOT VERSION, WTF ?!");
    }

    return [events.map(e => e.payload).map(EventCodec.unserialize), aggregate.version];
}

export { loadEventStream };