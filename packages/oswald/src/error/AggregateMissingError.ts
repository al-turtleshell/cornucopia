
class AggregateMissingError extends Error {
    constructor(aggregateName: string, aggregateId: string) {
        super(`Aggregate ${aggregateName} not found with id ${aggregateId}`);
        this.name = "AggregateMissingError";
        Object.setPrototypeOf(this, AggregateMissingError.prototype);
    }
}

export { AggregateMissingError };