/*
    Copyright 2018 Magaya Corporation
*/

const stream = require('./stream');

class AsyncBase {
    constructor(asyncApi, cursor) {
        this.async = asyncApi;
        this.cursor = cursor;
    }
}

class ForEachAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    callback(callbackFunction) {
        return new Promise((resolve, reject) => {
            if (!this.cursor) {
                return resolve();
            }

            this.async.forEachAsync(this.cursor, callbackFunction, resolve);
        });
    }
}

class TransformAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    callback(callbackFunction) {
        return new Promise((resolve, reject) => {
            let result = [];

            if (!this.cursor) {
                return resolve(result);
            }

            this.async.forEachAsync(
                this.cursor,
                (currentObject) => {
                    result.push(callbackFunction(currentObject))
                },
                () => { resolve(result) })
        });
    }
}

class AccumulateAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    callback(initValue, callbackFunction) {
        return new Promise((resolve, reject) => {
            let result = initValue;

            if (!this.cursor) {
                return resolve(result);
            }

            this.async.forEachAsync(
                this.cursor,
                (currentObject) => {
                    result = callbackFunction(result, currentObject)
                },
                () => { resolve(result) }
            );
        });
    }
}

class CollectAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    where(predicate) {
        return new Promise((resolve, reject) => {
            const result = [];

            if (!this.cursor) {
                return resolve(result);
            }

            this.async.forEachAsync(
                this.cursor,
                (currentObject) => {
                    if (predicate(currentObject)) {
                        result.push(currentObject);
                    }
                },
                () => { resolve(result) }
            );
        });
    }
}

class AnyOfAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    where(predicate) {
        return new Promise((resolve, reject) => {
            let predicateResult = false;

            if (!this.cursor) {
                return resolve(predicateResult);
            }

            this.async.whileAsync(
                this.cursor,
                (currentObject) => {
                    predicateResult = predicate(currentObject);
                    return !predicateResult;
                },
                () => { resolve(predicateResult) }
            );
        });
    }
}

class AllOfAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    where(predicate) {
        return new Promise((resolve, reject) => {
            let predicateResult = false;

            if (!this.cursor) {
                return resolve(predicateResult);
            }

            this.async.whileAsync(
                this.cursor,
                (currentObject) => {
                    predicateResult = predicate(currentObject);
                    return predicateResult;
                },
                () => { resolve(predicateResult) }
            );
        });
    }
}

class NoneOfAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    where(predicate) {
        return new Promise((resolve, reject) => {
            let predicateResult = false;

            if (!this.cursor) {
                return resolve(predicateResult);
            }

            this.async.whileAsync(
                this.cursor,
                (currentObject) => {
                    predicateResult = predicate(currentObject);
                    return !predicateResult;
                },
                () => { resolve(!predicateResult) }
            );
        });
    }
}

class FindAsync extends AsyncBase {
    constructor(asyncApi, cursor) {
        super(asyncApi, cursor);
    }

    where(predicate) {
        return new Promise((resolve, reject) => {
            let foundObject;

            if (!this.cursor) {
                return resolve(foundObject);
            }

            this.async.whileAsync(
                this.cursor,
                (currentObject) => {
                    if (predicate(currentObject)) {
                        foundObject = currentObject;
                        return false;
                    }
                    return true;
                },
                () => { resolve(foundObject) }
            );
        });
    }
}

class SelectAsync extends AsyncBase {
    constructor(asyncApi, cursor, count) {
        super(asyncApi, cursor);
        this.count = count;
        this.predicate = () => true;
        this.shouldPreProject = false;
    }

    where(predicate) {
        this.predicate = predicate;
        return this;
    }

    preProject(shouldPreProject) {
        this.shouldPreProject = shouldPreProject;
        return this;
    }

    project(projectFunction) {
        // Assume most of the time we won't be pre-projecting
        let preProjecFunction = (obj) => obj;
        let postProjectFunction = projectFunction;

        if (this.shouldPreProject) {
            postProjectFunction = preProjecFunction;
            preProjecFunction = projectFunction;
        }

        return new Promise((resolve, reject) => {
            const result = [];

            if (!this.cursor) {
                return resolve(result);
            }

            this.async.whileAsync(
                this.cursor,
                (currentObject) => {
                    const objectToEvaluate = preProjecFunction(currentObject);

                    if (this.predicate(objectToEvaluate)) {
                        result.push(postProjectFunction(objectToEvaluate));
                    }

                    return result.length < this.count;
                },
                () => { resolve(result) }
            );
        });
    }
}

module.exports = function (asyncApi) {
    this.forEach = function (cursor) {
        return new ForEachAsync(asyncApi, cursor);
    };

    this.transform = function (cursor) {
        return new TransformAsync(asyncApi, cursor);
    };

    this.accumulate = function (cursor) {
        return new AccumulateAsync(asyncApi, cursor);
    };

    this.anyOf = function (cursor) {
        return new AnyOfAsync(asyncApi, cursor);
    };

    this.allOf = function (cursor) {
        return new AllOfAsync(asyncApi, cursor);
    };

    this.noneOf = function (cursor) {
        return new NoneOfAsync(asyncApi, cursor);
    };

    this.find = function (cursor) {
        return new FindAsync(asyncApi, cursor);
    };

    this.findFirst = function (cursor) {
        return new FindAsync(asyncApi, cursor).where(_ => true);
    };

    this.collect = function (cursor) {
        return new CollectAsync(asyncApi, cursor);
    };

    this.select = function (cursor, count) {
        return new SelectAsync(asyncApi, cursor, count);
    };

    this.streamAttachmentContent = function (attachment, writeStream) {
        return new stream.StreamAttachment(asyncApi, attachment).stream(writeStream);
    };

    this.streamDocumentContent = function (document, writeStream) {
        return new stream.StreamDocument(asyncApi, document).stream(writeStream);
    }
};