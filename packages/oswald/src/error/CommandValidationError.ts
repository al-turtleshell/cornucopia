
class CommandValidationError extends Error {
    public readonly reason: string;

    constructor(commandName: string, reason: string) {
        super(`Command ${commandName} validation error: ${reason}`);
        this.name = "CommandValidationError";
        this.reason = reason;
        Object.setPrototypeOf(this, CommandValidationError.prototype);
    }
}

export { CommandValidationError };