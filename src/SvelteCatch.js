import { log } from './log.js'
import { enumCatchLocation } from './enumCatchLocation.js'


export class SvelteCatch {
  /** @type { string } */
  #defaultError
  /** @type { enumCatchLocation }  */
  #location


  /**
   * Catch, format and log errors
   * @param { enumCatchLocation } location - May be "server" or "pageServer"
   * @param { string } [ defaultError ] - Default is: "We apologize, there is an error."
   */
  constructor (location, defaultError) {
    if (location !== enumCatchLocation.pageServer && location !== enumCatchLocation.server) throw { id: 'fln__svelte-catch__invalid-location', message: 'Location must be "server" or "pageServer"', _errorData: { location } }
    else {
      this.#location = location
      this.#defaultError = defaultError || 'We apologize, there is an error.'
    }
  }


  /**
   * Catch, format and log error.
   * IF this is a redirect error from `import { redirect } from '@sveltejs/kit'` the error is thrown immediately w/o formatting or logging.
   * IF `this.#location` === `"server"` AND this is not a redirect error, please pass `json` from `import { json } from '@sveltejs/kit'` to `this.catch()`
   * @param { any } originalError 
   * @param { (data: any, init?: ResponseInit | undefined) => Response } [json] 
   * @returns { any | { _errors: import('./typedefs.js').flnErrors } }
   */
  catch (originalError, json) {
    if (originalError?.status && originalError?.location?.startsWith('/')) throw originalError // redirect error
    else if (this.#location === enumCatchLocation.server && !json) throw { id: 'fln__svelte-catch__missing-json', message: 'IF this.#location === "server" AND this is not a redirect error, please pass json from import { json } from "@sveltejs/kit"', _errorData: { json } }
    else {
      const formattedError = this.#location === enumCatchLocation.pageServer ?
        this.#getFormattedError(originalError) :
        json(this.#getFormattedError(originalError), { status: 500 })

      log({ originalError, formattedError })

      return formattedError
    }
  }


  /**
   * Returns a formatted error
   * @param { any } originalError 
   * @returns { any | { _errors: import('./typedefs.js').flnErrors } }
   */
  #getFormattedError (originalError) {
    /** @type { any | { _errors: import('./typedefs.js').flnErrors } } */
    let formattedError = { _errors: [] }

    if (!originalError) formattedError._errors.push(this.#defaultError)
    else {
      if (typeof originalError === 'string') formattedError._errors.push(originalError)
      else if (typeof originalError?.format === 'function') formattedError = originalError.format()
      else if (Array.isArray(originalError?._errors)) formattedError = { ...originalError }
      else if (originalError.message) formattedError = { _errors: [ originalError.message ] }
      else formattedError._errors.push(this.#defaultError)
    }

    if (formattedError._errorData) delete formattedError._errorData

    return formattedError
  }
}
