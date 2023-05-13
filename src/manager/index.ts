import {
  AuthorizableConfig,
  Config,
  MappingList,
  ResourceDriverContract,
} from '@ioc:Adonis/Addons/Authorizable'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Manager } from '@poppinss/manager'
import AuthorizableFactory from '../factory'

export default class AuthorizableManager extends Manager<
  any,
  Omit<ResourceDriverContract, 'members' | 'member'>,
  Omit<ResourceDriverContract, 'members' | 'member'>,
  MappingList
> {
  protected singleton = true

  // @ts-ignore
  protected getDefaultMappingName() {
    return 'base'
  }

  protected getMappingDriver() {
    return 'base'
  }

  protected getMappingConfig(mappingName: string) {
    // @ts-ignore
    return this.config.list[mappingName]
  }

  constructor(
    private readonly application: ApplicationContract,
    private readonly config: AuthorizableConfig
  ) {
    super({})
  }

  public createBase(_: string, config: Config) {
    const database = this.application.container.use('Adonis/Lucid/Database')
    return AuthorizableFactory(config, database)
  }
}
