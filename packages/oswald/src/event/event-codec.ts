import { instanceToPlain, plainToInstance } from "class-transformer";
import { Event } from "./event";
import { eventClassRegistry } from "./event-registry";

class EventCodec {

    public static serialize(ev: Event): Record<string, any>{
        return { __oswald__event_name: ev.constructor.name, ...instanceToPlain(ev) };
    }

    public static unserialize(data: any): Event {
        
        const { __oswald__event_name, ...eventData } = data;
        const classConstructor = eventClassRegistry[__oswald__event_name];
        
        //@ts-ignore
        return plainToInstance(classConstructor, eventData);
    }
};

export { EventCodec };