import {
  ScopeContract,
  ScopeRepositoryConfigContract,
  ScopeRepositoryContract,
} from '@ioc:Adonis/Addons/Authorizable'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'

export default class ScopeRepository implements ScopeRepositoryContract {
  constructor(
    private readonly config: ScopeRepositoryConfigContract,
    private readonly database: DatabaseContract
  ) {}

  public async create(name: string): Promise<number> {
    const [id] = await this.database.table(this.config.table).insert({ name }).returning('id')
    return id
  }

  public async delete(name: string): Promise<void> {
    await this.database.from(this.config.table).where('name', name).delete()
  }

  public async exists(name: string): Promise<boolean> {
    const scope = await this.database.from(this.config.table).where('name', name).first()
    return !!scope
  }

  public async find(field: string, value: any): Promise<ScopeContract> {
    return await this.database.from(this.config.table).where(field, value).firstOrFail()
  }
}
