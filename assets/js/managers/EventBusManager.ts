import mitt, { Emitter } from 'mitt'

class EventBusManager {
    private static instance: EventBusManager
    emitter: Emitter

    constructor() {
        this.emitter = mitt()
    }

    public static getInstance(): EventBusManager {
        if (!EventBusManager.instance) {
            EventBusManager.instance = new EventBusManager();
        }
 
        return EventBusManager.instance;
    }
}

export default EventBusManager