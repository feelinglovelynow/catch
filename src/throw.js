/**
 * Recieve an error string and return an array of errors
 * @param { string } message 
 * @param { any } [_errorData]
 * @returns { { _errors: import('./typedefs.js').flnErrors, _errorData: any } }
 */
export function one(message, _errorData) {
  return { _errors: [ message ], _errorData }
}


/**
 * Throw an array of errors
 * @param { import('./typedefs.js').flnErrors } _errors 
 * @param { any } _errorData 
 * @returns { { _errors: import('./typedefs.js').flnErrors, _errorData: any } }
 */
export function many(_errors, _errorData) {
  return { _errors, _errorData }
}
