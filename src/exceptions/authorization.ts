import { Exception } from '@poppinss/utils'

export class AuthorizationException extends Exception {
  public static raise(message: string, status: number) {
    return new this(message, status, 'E_AUTHORIZATION_FAILURE')
  }
}
