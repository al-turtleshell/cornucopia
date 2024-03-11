
class AggregateVersionMismatchError extends Error {
    constructor(aggregateName: string, aggregateId: string, givenVersion: string, expectedVersion: string) {
        super(`Aggregate ${aggregateName} with id ${aggregateId} version mismatch. Expected version ${expectedVersion} but got ${givenVersion}`);
        this.name = "AggregateVersionMismatchError";
        Object.setPrototypeOf(this, AggregateVersionMismatchError.prototype);
    }
}

export { AggregateVersionMismatchError };