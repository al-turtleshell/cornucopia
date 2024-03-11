import { FoodRegistered, FoodRegisteredFailed } from "@turtleshell/domain";

const eventClassRegistry: Record<string, unknown> = {
    "FoodRegistered": FoodRegistered,
    "FoodRegisteredFailed": FoodRegisteredFailed
};

export { eventClassRegistry };