# azure_storage_client

A simple client for Azure Storage REST API.

## Usage

You need a connection string for your an Azure storage account.
It has at least three fields:

- AccountName=*****;
- AccountKey=*****;
- EndpointSuffix=*****;

You can get it from the Azure portal.


```ts
import { Storage } from "https://deno.land/x/azure_storage_client@0.3.0/mod.ts"

let storage = new Storage(/* Connection string here */)

```

## Blob Examples

Each method returns a Response object.

### Create or Update a blob

```ts
let response = await storage
  .container('example') // A container name
  .put(
    'dir/file.txt', // A file path
    new TextEncoder().encode('Hello World'), // Blob or BufferSource
    'text/plain' // Content-Type
  )

console.log('isSucceed:': response.ok)
```

### Get a blob

```ts
let text = await storage
  .container('example')
  .get('dir/file.txt')
  .then(response => res.text())
```

### Get blobs

```ts
let text = await storage
  .container('example')
  .list('dir')
  .then(response => res.text())
```

### Delete a blob

```ts
let response = await storage
  .container('example')
  .delete('dir/file.txt')

console.log('isDeleted:': response.ok)
```


## Table Examples

Each method returns a Response object.

### Create a entity

```ts
let response = await storage
  .table('example')
  .post('abc', 'def', { // A partition key and a row key
    key1: 'value' // A string or number or boolean
    key2: 100
  })

console.log('isSucceed:': response.ok)
```

### Get a entity

```ts
let entity = await storage
  .table('example')
  .get('abc', 'def')
  .then(response => res.json())
```

### Update a entity

```ts
let response = await storage
  .table('example')
  .merge('abc', 'def', {
    key2: 400
  })

console.log('isSucceed:': response.ok)
```

### Create or Update a entity

```ts
let response = await storage
  .table('example')
  .put('abc', 'def', {
    key1: 'value'
    key2: 400
  })

console.log('isSucceed:': response.ok)
```

### Delete a entity

```ts
let response = await storage
  .table('example')
  .delete('abc', 'def')

console.log('isDeleted:': response.ok)
```