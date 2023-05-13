declare module '@ioc:Adonis/Core/Application' {
  import Authorizable from '@ioc:Adonis/Addons/Authorizable'

  export interface ContainerBindings {
    'Adonis/Addons/Authorizable': typeof Authorizable
  }
}
