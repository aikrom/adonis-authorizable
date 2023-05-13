import { Application } from '@adonisjs/core/build/standalone'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import { Filesystem } from '@poppinss/dev-utils'
import { join, posix, sep } from 'path'
import MemberDriver from '../src/drivers/member'
import ResourceDriver from '../src/drivers/resource'
import AuthorizableManager from '../src/manager'
import MemberRepository from '../src/repositories/member'
import MemberPermissionRepository from '../src/repositories/member_permission'
import MemberScopeRepository from '../src/repositories/member_scope'
import PermissionRepository from '../src/repositories/permission'
import ScopeRepository from '../src/repositories/scope'

export const fs = new Filesystem(join(__dirname, '__app'))

export async function setupApplication() {
  await fs.add('.env', '')

  await fs.add(
    'config/app.ts',
    `
    export const appKey = 'averylong32charsrandomsecretkey'
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
  `
  )

  await fs.add(
    'config/database.ts',
    `
		const databaseConfig = {
      connection: 'main',
      connections: {
        main: {
          client: 'sqlite3',
          connection: {
            filename: '${join(fs.basePath, 'primary.sqlite3').split(sep).join(posix.sep)}',
          },
        },
      }
    }
		export default databaseConfig
	`
  )

  await fs.add(
    'config/authorizable.ts',
    `
    const authorizableConfig = {
      list: {
        resource: {
          member: {
            table: 'resource_member',
            memberColumn: 'member_id',
            resourceColumn: 'resource_id',
            scope: {
              table: 'resource_member_scopes',
            },
            permission: {
              table: 'resource_member_permissions',
            },
          },
          scope: {
            table: 'resource_scopes',
          },
          permission: {
            table: 'resource_permissions',
          },
        },
      },
    }
    export default authorizableConfig
  `
  )

  const app = new Application(fs.basePath, 'test', {
    aliases: {
      App: './app',
    },
    providers: ['@adonisjs/core', '@adonisjs/lucid'],
  })

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}

async function createResourceTable(db: DatabaseContract) {
  await db.connection().schema.createTableIfNotExists('resources', (table) => {
    table.increments('id').primary()
  })
}

async function createMemberTable(db: DatabaseContract) {
  await db.connection().schema.createTableIfNotExists('members', (table) => {
    table.increments('id').primary()
  })
}

async function createResourceMemberTable(db: DatabaseContract) {
  await db.connection().schema.createTableIfNotExists('resource_member', (table) => {
    table.increments('id').primary()
    table.integer('member_id').unsigned().references('members.id')
    table.integer('resource_id').unsigned().references('resources.id')
  })
}

async function createResourceScopesTable(db: DatabaseContract) {
  await db.connection().schema.createTableIfNotExists('resource_scopes', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable().unique()
  })
}

async function createResourcePermissionsTable(db: DatabaseContract) {
  await db.connection().schema.createTableIfNotExists('resource_permissions', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable().unique()
    table.integer('scope_id').unsigned().references('resource_scopes.id')
  })
}

async function createResourceMemberScopesTable(db: DatabaseContract) {
  await db.connection().schema.createTableIfNotExists('resource_member_scopes', (table) => {
    table.increments('id').primary()
    table.integer('member_id').unsigned().references('members.id')
    table.integer('resource_id').unsigned().references('resources.id')
    table.integer('scope_id').unsigned().references('resource_scopes.id')
  })
}

async function createResourceMemberPermissionsTable(db: DatabaseContract) {
  await db.connection().schema.createTableIfNotExists('resource_member_permissions', (table) => {
    table.increments('id').primary()
    table.integer('member_id').unsigned().references('members.id')
    table.integer('resource_id').unsigned().references('resources.id')
    table.integer('permission_id').unsigned().references('resource_permissions.id')
  })
}

export async function setup(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  await createResourceTable(db)
  await createMemberTable(db)
  await createResourceMemberTable(db)
  await createResourceScopesTable(db)
  await createResourcePermissionsTable(db)
  await createResourceMemberScopesTable(db)
  await createResourceMemberPermissionsTable(db)
}

export async function cleanup(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  await db.connection().schema.dropTableIfExists('resources')
  await db.connection().schema.dropTableIfExists('members')
  await db.connection().schema.dropTableIfExists('resource_member')
  await db.connection().schema.dropTableIfExists('resource_scopes')
  await db.connection().schema.dropTableIfExists('resource_permissions')
  await db.connection().schema.dropTableIfExists('resource_member_scopes')
  await db.connection().schema.dropTableIfExists('resource_member_permissions')
}

export async function reset(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  await db.connection().truncate('resources')
  await db.connection().truncate('members')
  await db.connection().truncate('resource_member')
  await db.connection().truncate('resource_scopes')
  await db.connection().truncate('resource_permissions')
  await db.connection().truncate('resource_member_scopes')
  await db.connection().truncate('resource_member_permissions')
}

export function getScopeRepository(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  const config = application.container.use('Adonis/Core/Config').get('authorizable')
  return new ScopeRepository(config.list['resource'].scope, db)
}

export function getMemberRepository(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  const config = application.container.use('Adonis/Core/Config').get('authorizable')
  return new MemberRepository(config.list['resource'].member, db)
}

export function getPermissionRepository(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  const config = application.container.use('Adonis/Core/Config').get('authorizable')
  const scope = getScopeRepository(application)
  return new PermissionRepository(config.list['resource'].permission, db, scope)
}

export function getMemberScopeRepository(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  const config = application.container.use('Adonis/Core/Config').get('authorizable')
  const scope = getScopeRepository(application)
  return new MemberScopeRepository(
    { ...config.list['resource'].member.scope, scope: config.list['resource'].scope },
    db,
    scope
  )
}

export function getMemberPermissionRepository(application: ApplicationContract) {
  const db = application.container.use('Adonis/Lucid/Database')
  const config = application.container.use('Adonis/Core/Config').get('authorizable')
  const permission = getPermissionRepository(application)
  const memberScope = getMemberScopeRepository(application)
  return new MemberPermissionRepository(
    {
      ...config.list['resource'].member.permission,
      permission: config.list['resource'].permission,
    },
    db,
    permission,
    memberScope
  )
}

export function getMemberDriver(application: ApplicationContract) {
  const memberScope = getMemberScopeRepository(application)
  const memberPermission = getMemberPermissionRepository(application)
  return new MemberDriver(memberScope, memberPermission)
}

export function getResourceDriver(application: ApplicationContract) {
  const scope = getScopeRepository(application)
  const permission = getPermissionRepository(application)
  const member = getMemberRepository(application)
  const memberDriver = getMemberDriver(application)
  return new ResourceDriver(scope, permission, member, memberDriver)
}

export function getManager(application: ApplicationContract) {
  const config = application.container.use('Adonis/Core/Config').get('authorizable')
  return new AuthorizableManager(application, config)
}

function getId() {
  return Math.floor(Math.random() * 10000)
}

export function getMember() {
  return { id: getId() }
}

export function getResource() {
  return { id: getId() }
}
