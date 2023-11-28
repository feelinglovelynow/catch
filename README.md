# 🕉 @feelinglovelynow/svelte-catch


## 💎 Install
```bash
pnpm add @feelinglovelynow/svelte-catch
```


## 🙏 Description
* Ease error handling in SvelteKit with functions to help with catching, parsing and logging errors
* Errors condense down to an array of strings that works nicely with [@feelinglovelynow/toast](https://www.npmjs.com/package/@feelinglovelynow/toast)
* Original error, formatted error, and stack trace is logged on error


## 💚 Add log and trace to terminal
* `log (data: any): void`
```ts
import { log } from '@feelinglovelynow/svelte-catch'

log({ hello: 'world', foo: 'bar' })
```
* Terminal Output
```bash
---FLN LOG START---
{ hello: 'world', foo: 'bar' }
Trace
    at Module.log (/Users/fln/@feelinglovelynow/svelte-catch/dist/log.js:6:13)
    at load (/Users/fln/feelinglovelynow/src/routes/+layout.server.ts:18:27)
    at Module.load_server_data (/Users/fln/feelinglovelynow/node_modules/.pnpm/@sveltejs+kit@1.27.6_svelte@4.2.3_vite@4.5.0/node_modules/@sveltejs/kit/src/runtime/server/page/load_data.js:57:41)
---FLN LOG END---
```

## 💛 Add these helper functions to ease working with `@feelinglovelynow/svelte-catch`
```ts
import { onMount } from 'svelte'
import { json } from '@sveltejs/kit'
import showToast from '@feelinglovelynow/toast'
import { SvelteCatch, enumCatchLocation } from '@feelinglovelynow/svelte-catch'


export function pageServerCatch (e: any) {
  const svelteCatch = new SvelteCatch(enumCatchLocation.pageServer, 'We apologize, there is an error with this page. Please try again and/or <a href="/links">contact us</a>')
  return svelteCatch.catch(e)
}


export function serverCatch (e: any) {
  const svelteCatch = new SvelteCatch(enumCatchLocation.server, 'We apologize, there is an error with this request. Please try again and/or <a href="/links">contact us</a>')
  return svelteCatch.catch(e, json)
}


export function routeCatch (data: any) {
  if (data?._errors?.length) {
    onMount(() => {
      showToast('info', data._errors)
    })
  }
}
```


## 🧡 Throw one error
```ts
import { one } from '@feelinglovelynow/svelte-catch'

export const load = (async () => {
  try {
    throw one('hello world', { foo: 'bar' })
  } catch (e) {
    return pageServerCatch(e)
  }
}) satisfies LayoutServerLoad
```
* Terminal Output
* `originalError` is the error that was recieved by the format error function
* `formattedError` is the error that will be returned to the `frontend`
```bash
---FLN LOG START---
{
  originalError: { _errors: [ 'hello world' ], _errorData: { foo: 'bar' } },
  formattedError: { _errors: [ 'hello world' ] }
}
Trace
    at Module.log (/Users/fln/@feelinglovelynow/svelte-catch/dist/log.js:6:13)
    at SvelteCatch.catch (/Users/fln/@feelinglovelynow/svelte-catch/dist/SvelteCatch.js:18:35)
    at Module.pageServerCatch (/Users/fln/feelinglovelynow/src/lib/global/catch.ts:11:27)
---FLN LOG END---
```
* Frontend that shows toast notification with the error
```svelte
<script lang="ts">
  import type { PageData } from './$types'
  import { routeCatch } from '$lib/global/catch'

  export let data: PageData
  routeCatch(data)
</script>
```


## ❤️ Throw many errors
* `many (_errors: string[], _errorData: any = undefined)`
```ts
import { many } from '@feelinglovelynow/svelte-catch'
import { serverCatch } from '$lib/global/catch'


export const GET = (async () => {
  try {
    const errors = [{ message: 'foo' }, { message: 'bar' }] // example graphql error
    const errorsAsArrayOfStrings = errors.map(e => e.message)
    const errorData = JSON.stringify({ errors })

    throw many(errorsAsArrayOfStrings, errorData)
  } catch (e) {
    return serverCatch(e)
  }
}) satisfies RequestHandler

```
* Terminal Output
* `originalError` is the error that was recieved by the parser
* `formattedError` is the error that will be returned to the `frontend`
```bash
---FLN LOG START---
{
  originalError: {
    _errors: [ 'foo', 'bar' ],
    _errorData: '{"errors":[{"message":"foo"},{"message":"bar"}]}'
  },
  formattedError: { _errors: [ 'foo', 'bar' ] }
}
Trace
    at Module.log (/Users/fln/@feelinglovelynow/svelte-catch/dist/log.js:6:13)
    at SvelteCatch.catch (/Users/fln/@feelinglovelynow/svelte-catch/dist/SvelteCatch.js:19:62)
    at Module.serverCatch (/Users/fln/feelinglovelynow/src/lib/global/catch.ts:16:27)
---FLN LOG END---
```
* Frontend that shows toast notification with the error
```svelte
<script lang="ts">
  import type { PageData } from './$types'
  import { routeCatch } from '$lib/global/catch'

  export let data: PageData
  routeCatch(data)
</script>
```

## 💟 Zod Support
* Schema
```ts
import { z } from 'zod'


export const schemaSearch = z
  .object({
    isQuotesChecked: z.any().optional(), // allow .superRefine() to do the validation
    isSourcesByTitleChecked: z.any().optional(), // allow .superRefine() to do the validation
    isSourcesByDescriptionChecked: z.any().optional(), // allow .superRefine() to do the validation
    query: z.string().min(3, 'Query is at least 3 characters please'),
  })
  .superRefine(({ isQuotesChecked, isSourcesByTitleChecked, isSourcesByDescriptionChecked }, ctx) => {
    if (!isQuotesChecked && !isSourcesByTitleChecked && !isSourcesByDescriptionChecked) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select atleast one checkbox please' })
  })


export type SchemaSearch = z.infer<typeof schemaSearch>
```
* Server
```ts
import type { RequestHandler } from './$types'
import { serverCatch } from '$lib/global/catch'
import { schemaSearch, type SchemaSearch } from '$lib/zod/search'


export const POST = (async ({ request }) => {
  try {
    const body = (await request.json()) as SchemaSearch
    schemaSearch.parse(body)
  } catch (e) {
    return serverCatch(e)
  }
}) satisfies RequestHandler
```
* Response to Frontend `_errors` can be sent to [@feelinglovelynow/toast](https://www.npmjs.com/package/@feelinglovelynow/toast)
```ts
{
  "_errors":[
    "Select atleast one checkbox please"
  ],
  "query":{
    "_errors":[
      "Query is at least 3 characters please"
    ]
  }
}
```


## 🌟 Redirect
```ts
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { pageServerCatch } from '$lib/global/catch'

export const load = (async ({ locals }) => {
  try {
    if (!locals.userUid) throw redirect(302, '/auth/sign-in')
  } catch (e) {
    return pageServerCatch(e)
  }
}) satisfies PageServerLoad
```


## ✨ Formatted error of random error formats
* `formattedError` is the error that will be returned to the `frontend`
* IF `_errorData` is in the throw we do not return `_errorData` to the frontend but `_errorData` is logged in the terminal
```ts
throw 'hello world' // IF e is strng => we put string into array
formattedError: { _errors: [ 'hello world' ] }


throw new Error('foo') // IF e.message found => we put e.message into array
formattedError: { _errors: [ 'foo' ] }


throw { format: () => ({ foo: 'bar' }) } // IF e.format() found => formattedError is the response from e.format()
formattedError: { foo: 'bar' }


throw null // IF !e => formattedError is the default error set above @ pageServerCatch or serverCatch
formattedError: {
  _errors: [
    'We apologize, there is an error with this page. Please try again and/or <a href="/links">contact us</a>'
  ]
}


throw { _errors: [ 'hello', 'world' ], foo: 'bar' } // IF _errors array found => no parsing done
formattedError: { _errors: [ 'hello', 'world' ], foo: 'bar' }


throw { message: 'hello world' } // IF e.message found => we put e.message into array
formattedError: { _errors: [ 'hello world' ] }
```


## 🎁 All Our Packages
1. @feelinglovelynow/dgraph: [NPM](https://www.npmjs.com/package/@feelinglovelynow/dgraph) ⋅ [Github](https://github.com/feelinglovelynow/dgraph)
1. @feelinglovelynow/env-write: [NPM](https://www.npmjs.com/package/@feelinglovelynow/env-write) ⋅ [Github](https://github.com/feelinglovelynow/env-write)
1. @feelinglovelynow/get-form-entries: [NPM](https://www.npmjs.com/package/@feelinglovelynow/get-form-entries) ⋅ [Github](https://github.com/feelinglovelynow/get-form-entries)
1. @feelinglovelynow/get-relative-time: [NPM](https://www.npmjs.com/package/@feelinglovelynow/get-relative-time) ⋅ [Github](https://github.com/feelinglovelynow/get-relative-time)
1. @feelinglovelynow/global-style: [NPM](https://www.npmjs.com/package/@feelinglovelynow/global-style) ⋅ [Github](https://github.com/feelinglovelynow/global-style)
1. @feelinglovelynow/jwt: [NPM](https://www.npmjs.com/package/@feelinglovelynow/jwt) ⋅ [Github](https://github.com/feelinglovelynow/jwt)
1. @feelinglovelynow/loop-backwards: [NPM](https://www.npmjs.com/package/@feelinglovelynow/loop-backward) ⋅ [Github](https://github.com/feelinglovelynow/loop-backwards)
1. @feelinglovelynow/slug: [NPM](https://www.npmjs.com/package/@feelinglovelynow/slug) ⋅ [Github](https://github.com/feelinglovelynow/slug)
1. @feelinglovelynow/svelte-catch: [NPM](https://www.npmjs.com/package/@feelinglovelynow/svelte-catch) ⋅ [Github](https://github.com/feelinglovelynow/svelte-catch)
1. @feelinglovelynow/svelte-kv: [NPM](https://www.npmjs.com/package/@feelinglovelynow/svelte-kv) ⋅ [Github](https://github.com/feelinglovelynow/svelte-kv)
1. @feelinglovelynow/svelte-loading-anchor: [NPM](https://www.npmjs.com/package/@feelinglovelynow/svelte-loading-anchor) ⋅ [Github](https://github.com/feelinglovelynow/svelte-loading-anchor)
1. @feelinglovelynow/svelte-modal: [NPM](https://www.npmjs.com/package/@feelinglovelynow/svelte-modal) ⋅ [Github](https://github.com/feelinglovelynow/svelte-modal)
1. @feelinglovelynow/svelte-turnstile: [NPM](https://www.npmjs.com/package/@feelinglovelynow/svelte-turnstile) ⋅ [Github](https://github.com/feelinglovelynow/svelte-turnstile)
1. @feelinglovelynow/toast: [NPM](https://www.npmjs.com/package/@feelinglovelynow/toast) ⋅ [Github](https://github.com/feelinglovelynow/toast)
