# Hyperion-Algorithms - Base Algorithms for Hyperion

## Building blocks for Hyperion

Hyperion-Algorithms offers a set of functions for working with hyperion lists and working with documents.

```js
const Algorithms = require('hyperion-algorithms');
const connection = require('{get hyperion somehow}');

const algo = new Algorithms(connection.async);

algo.select(connection.hyperion.dbx.using(connection.hyperion.dbx.Shipping.Booking.ListByTime), 10)
    .where(booking => booking.GUID !== undefined)
    .project(booking => ({
        id: booking.GUID,
        createdOn: new Date(booking.CreatedOn)
    }))
    .then(bookings => console.log(bookings.length));
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
- [select](#select) - Used to obtain and transform a specific number of elements. Works like collect but will only iterate as far as needed to get the requested number of elements. 

## Examples

### forEach
---
```js
// Continuation pattern
algo.forEach(dbx.using(dbx.Shipping.Booking.ListByTime))
    .callback(booking => {
        doSomethingWith(booking);
    })
    .then(() => {
        // forEach does not return anything 
        console.log('done!');
    });

// Async/Await pattern
await algo.forEach(dbx.using(dbx.Shipping.Booking.ListByTime))
    .callback(booking => {
        doSomethingWith(booking);
    });

// forEach does not return anything 
console.log('done!');
```
### transform
---
```js
// Continuation pattern
algo.transform(dbx.using(dbx.Shipping.Booking.ListByTime))
    .callback(booking => {
        return {
            creator: booking.CreatedByName,
            created: new Date(booking.CreatedOn)
            status: booking.Status
        };
    })
    .then(bookings => {
        // We have an array of the transformed bookings
        bookings.forEach(b => console.log(b.creator));
    });

// Async/Await pattern
const bookings = await algo.transform(dbx.using(dbx.Shipping.Booking.ListByTime))
    .callback(booking => {
        return {
            creator: booking.CreatedByName,
            created: new Date(booking.CreatedOn)
            status: booking.Status
        };
    });

// We have an array of the transformed bookings
bookings.forEach(b => console.log(b.creator));
```
### accumulate
---
```js
// Continuation pattern
algo.accumulate(dbx.using(dbx.Shipping.Booking.ListByTime))
    .callback(0, (total, booking) => {   // first argument is the initial value
        // The new accumlation should be returned, so it can be
        // sent in the next iteration
        return total += booking.TotalWeight; 
    })
    .then(totalWeight => {
        // The final result of the accumulation
        console.log(totalWeight);
    });

// Async/Await pattern
const totalWeight = await algo.accumulate(dbx.using(dbx.Shipping.Booking.ListByTime))
    .callback(0, (total, booking) => {   // first argument is the initial value
        // The new accumlation should be returned, so it can be
        // sent in the next iteration
        return total += booking.TotalWeight; 
    });

// The final result of the accumulation
console.log(totalWeight);
```    
### anyOf
---
```js
// Continuation pattern
algo.anyOf(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.TotalPieces > 0) // Will stop iteration on first true
    .then(result => result
        ? console.log('At least one booking has pieces.')
        : console.log('All bookings are empty!'));

// Async/Await pattern
const result = await algo.anyOf(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.TotalPieces > 0); // Will stop iteration on first true

result ? console.log('At least one booking has pieces.') : console.log('All bookings are empty!'));
```
### allOf
---
```js
// Continuation pattern
algo.allOf(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.TotalPieces > 0) // Will stop iteration on first false
    .then(result => result
        ? console.log('All bookings have pieces.')
        : console.log('At least one booking is empty!'));

// Async/Await pattern
const result = await algo.allOf(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.TotalPieces > 0); // Will stop iteration on first false

result ? console.log('All bookings have pieces.') : console.log('At least one booking is empty!'));
```
### noneOf
---
```js
// Continuation pattern
algo.noneOf(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.TotalPieces > 0) // Will stop iteration on first false
    .then(result => result
        ? console.log('All bookings are empty!')
        : console.log('At least one booking has pieces.'));

// Async/Await pattern
const result = await algo.noneOf(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.TotalPieces > 0); // Will stop iteration on first false

result ? console.log('All bookings are empty!') : console.log('At least one booking has pieces.'));
```
### find
---
```js
// Continuation pattern
algo.find(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.CreatedByName === 'Jane Doe')
    .then(booking => {
        // We now have the first booking that was created by Jane Doe or no booking
        // Note: these are still hyperion objects
        if (booking) {
            console.log(new Date(booking.CreatedOn));
        }      
    });

// Async/Await pattern
const bookings = await algo.find(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.CreatedByName === 'Jane Doe');

// We now have the first booking that was created by Jane Doe or no booking
// Note: these are still hyperion objects
if (booking) {
    console.log(new Date(booking.CreatedOn));
}
```
### findFirst
---
```js
// Continuation pattern
algo.findFirst(dbx.using(dbx.Shipping.Booking.ListByTime))
    .then(booking => {
        // We now have the first booking in the cursor
        // Note: these are still hyperion objects
        if (booking) {
            console.log(booking.CreatedByName);
        } 
    });

// Async/Await pattern
const booking = await algo.findFirst(dbx.using(dbx.Shipping.Booking.ListByTime));

// We now have the first booking in the cursor
// Note: these are still hyperion objects
if (booking) {
    console.log(booking.CreatedByName);
}
```
### collect
---
```js
// Continuation pattern
algo.collect(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.CreatedByName === 'Jane Doe')
    .then(bookings => {
        // We now have all the bookings created by Jane Doe
        // Note: these are still hyperion objects
        bookings.forEach(booking => {
            console.log(`${booking.CreatedByName}: ${new Date(booking.CreatedOn)}`);
        });        
    });

// Async/Await pattern
const bookings = await algo.collect(dbx.using(dbx.Shipping.Booking.ListByTime))
    .where(booking => booking.CreatedByName === 'Jane Doe');

// We now have all the bookings created by Jane Doe
// Note: these are still hyperion objects
bookings.forEach(booking => {
    console.log(`${booking.CreatedByName}: ${new Date(booking.CreatedOn)}`);
});
```
### select
---
```js
// Continuation pattern
// Specify number of elements to retrieve
algo.select(dbx.using(dbx.Shipping.Booking.ListByTime), 10) 
    .project(booking => ({
        id: booking.GUID,
        createdOn: new Date(booking.CreatedOn)
    }))
    .then(bookings => console.log(bookings.length)); // Should be at most 10, but could be less

// Async/Await pattern
// Specify number of elements to retrieve
const bookings = await algo.select(dbx.using(dbx.Shipping.Booking.ListByTime), 10)  
    .project(booking => ({
        id: booking.GUID,
        createdOn: new Date(booking.CreatedOn)
    }));

console.log(bookings.length); // Should be at most 10, but could be less

// Select can have a 'where' predicate, but isn't mandatory
algo.select(dbx.using(dbx.Shipping.Booking.ListByTime), 10) 
    .where(booking => booking.CreatedByName === 'Jane Doe') // only the first 10 by Jane Doe
    .project(booking => ({
        id: booking.GUID,
        createdOn: new Date(booking.CreatedOn)
    }))
    .then(bookings => console.log(bookings.length)); // Should be at most 10, but could be less

// Select lets you filter after the transform from 'project'
// seldom used but may be useful in some scenarios
algo.select(dbx.using(dbx.Shipping.Booking.ListByTime), 10)
    .preProject(true) // We want to apply 'where' to non-hyperion object
    .where(booking => !booking.overBooked) // Note use of projected property 'overBooked'
    .project(booking => ({
        id: booking.GUID,
        createdOn: new Date(booking.CreatedOn),
        overBooked: booking.TotalPieces > booking.MaximumPieces
    }))
    .then(bookings => {
        // Note: this is still the transformed object
        bookings.forEach(b => {
            console.log(`${b.id} was overbooked on ${b.createdOn}`);
        });
    }); 
```