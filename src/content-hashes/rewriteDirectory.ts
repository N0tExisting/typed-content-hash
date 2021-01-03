import { chain, execEffect } from '@typed/fp'
import { Disposable } from '@typed/fp/Disposable/exports'
import { pipe } from 'fp-ts/function'
import { resolve } from 'path'

import { hashDirectory, writeHashedDirectory } from './application'
import { Directory, FilePath } from './domain'
import {
  deleteDocuments,
  HashPluginEnvs,
  HashPluginFactory,
  provideHashDirectoryEnv,
  writeDocuments,
} from './infrastructure'

export type RewriteDirectoryOptions<Plugins extends ReadonlyArray<HashPluginFactory<any>>> = {
  pluginEnv: HashPluginEnvs<Plugins>
  directory: string
  plugins: Plugins
  hashLength: number
  assetManifest: string
  baseUrl?: string
}

export function rewriteDirectory<Plugins extends ReadonlyArray<HashPluginFactory<any>>>({
  directory,
  plugins,
  hashLength,
  assetManifest,
  baseUrl,
  pluginEnv,
}: RewriteDirectoryOptions<Plugins>): Disposable {
  return pipe(
    hashDirectory,
    chain(writeHashedDirectory),
    provideHashDirectoryEnv({
      directory: Directory.wrap(directory),
      baseUrl,
      plugins,
      hashLength,
    }),
    execEffect({
      ...pluginEnv,
      assetManifest: FilePath.wrap(resolve(directory, assetManifest)),
      writeDocuments,
      deleteDocuments,
    }),
  )
}
