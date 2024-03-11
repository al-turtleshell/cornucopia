import { OutboxState } from "@prisma/client";
import prisma from "../prisma";
import type { AggregateRoot } from "../../aggregate/aggregate";
import { EventCodec } from "../../event/event-codec";
import { v4 as uuid } from 'uuid';


async function appendEventsToStream(aggregate: AggregateRoot): Promise<void> {

    const events = aggregate.getUncommittedChanges();
    const serializedEvents = events.map(EventCodec.serialize);
    const newVersion = uuid();

    await prisma.$transaction(async tx => {
        await tx.eventStore.createMany({
            data: serializedEvents.map(ev => ({
                id: ev.eventId,
                aggregateId: aggregate.id,
                payload: ev,
                type: ev.__oswald__event_name
            }))
        });

        await tx.aggregateVersion.upsert({
            where: {
                aggregateId: aggregate.id
            },
            update: {
                version: newVersion
            },
            create: {
                aggregateId: aggregate.id,
                version: newVersion
            }
        });

        await tx.outbox.createMany({
            data: serializedEvents.map(ev => ({
                id: ev.eventId,
                payload: ev,
                type: ev.__oswald__event_name,
                state: OutboxState.Pending
            }))
        })
    })
    
    aggregate.markChangesAsCommitted(newVersion);
}

export { appendEventsToStream };