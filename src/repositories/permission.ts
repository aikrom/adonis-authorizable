import {
  PermissionContract,
  PermissionRepositoryConfigContract,
  PermissionRepositoryContract,
} from '@ioc:Adonis/Addons/Authorizable'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import ScopeRepository from './scope'

export default class PermissionRepository implements PermissionRepositoryContract {
  constructor(
    private readonly config: PermissionRepositoryConfigContract,
    private readonly database: DatabaseContract,
    private readonly scopeRepository: ScopeRepository
  ) {}

  public async create(data: { name: string; scope: string }): Promise<number> {
    const scope = await this.scopeRepository.find('name', data.scope)
    const [id] = await this.database
      .table(this.config.table)
      .returning('id')
      .insert({ name: data.name, scope_id: scope.id })

    return id
  }

  public async delete(name: string): Promise<void> {
    await this.database.from(this.config.table).where('name', name).delete()
  }

  public async exists(name: string): Promise<boolean> {
    const permission = await this.database.from(this.config.table).where('name', name).first()
    return !!permission
  }

  public async find(field: string, value: any): Promise<PermissionContract> {
    return await this.database.from(this.config.table).where(field, value).firstOrFail()
  }
}
