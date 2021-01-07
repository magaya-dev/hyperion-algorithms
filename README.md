# Hyperion-Algorithms - Base Algorithms for Hyperion

## Building blocks for Hyperion

Hyperion-Algorithms offers a set of functions for working with hyperion lists and working with documents.

```js
const Algorithms = require('hyperion-algorithms');
const connection = require('{get hyperion somehow}');

const algo = new Algorithms(connection.async);

algo.select(connection.hyperion.using(connection.hyperion.dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.GUID !== undefined)
    .project(booking => ({
        id: booking.GUID,
        createdOn: new Date(booking.CreatedOn)
    }))
    .then(bookings => console.log(bookings));
```

## Algorithms
- [forEach](#forEach) - Used to iterate through a cursor, does not return anything, but will execute function for each element.
- [transform](#transform) - Used to transform individual elements in cursor into different representation. Returns transformed collection.
- [accumulate](#accumulate) - Used to obtain a single result from iterating a cursor. Can be used for sums and other reductions.
- [anyOf](#anyOf) - Returns true if at least one item returned by cursor matches predicate.
- [allOf](#allOf) - Returns true if all items returned by cursor matches predicate.
- [noneOf](#noneOf) - Returs true if no items returned by cursor match predicate.
- [find](#find) - Returns first item that matches predicate.
- [findFirst](#findFirst) - Returns first element in the cursor, no predicate.
- [collect](#collect) - Iterates the entire cursor and returns array of all elements that match predicate.
- [select](#select) - Used to obtain a specific number of element. Works like collect but will only iterate as far as needed to get the requested number of elements.

---

### forEach
### transform
### accumulate
### anyOf
### allOf
### noneOf
### find
### findFirst
### collect
### select