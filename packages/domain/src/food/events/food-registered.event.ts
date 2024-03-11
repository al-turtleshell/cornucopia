import {Event, EventFailed} from '@turtleshell/oswald';

class FoodRegistered extends Event {
}

class FoodRegisteredFailed extends EventFailed {}

export { FoodRegistered, FoodRegisteredFailed }