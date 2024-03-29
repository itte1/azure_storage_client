import { AzureADApplication } from "./app.ts"

type KeyVaultResultAttributes = {
  enabled: boolean
  exp: number
  created: number
  updated: number
  recoveryLevel: string
  recoverableDays: number
  exportable?: boolean
}

export type SecretResult = {
  value: string
  id: string
  attributes: KeyVaultResultAttributes
  tags: Record<string, string>
}

export type KeyResult = {
  key: JsonWebKey
  attributes: KeyVaultResultAttributes
  tags: Record<string, string>
}

export type KeyVersionsResult = {
  value: {
    kid: string
    attributes: KeyVaultResultAttributes
    tags: Record<string, string>
  }
  nextLink: null | string
}

export type KeyVaultErrorResult = {
  error: {
    code: string
    message: string
  }
}

export class KeyVault {
  #app: AzureADApplication
  #name: string

  get app() {
    return this.#app
  }

  constructor(app: AzureADApplication, name: string) {
    this.#app = app
    this.#name = name
  }

  secret(name: string): Secret {
    return new Secret(this, name)
  }

  async fetch(
    method: string,
    url: string,
    data?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<Response> {
    await this.app.refresh()
    let option: RequestInit = { method }
    let requestHeaders: Record<string, string> = {
      Authorization: `Bearer ${this.app.accessToken}`
    }
    if (headers) {
      for (let headerName in headers) {
        requestHeaders[headerName] = headers[headerName]
      }
    }
    if (data) {
      option.body = JSON.stringify(data)
      requestHeaders['Content-Type'] = 'application/json'
    }
    option.headers = requestHeaders
    return await fetch(`https://${this.#name}.vault.azure.net/${url}`, option)
  }

  key(name: string): Key {
    return new Key(this, name)
  }
}
export class Secret {
  #vault: KeyVault
  #name: string

  constructor(vault: KeyVault, name: string, varsion?: string) {
    this.#vault = vault
    this.#name = name
  }

  get(): Promise<Response> {
    return this.#vault.fetch('GET', `/secrets/${this.#name}?api-version=7.3`)
  }

  getJson(): Promise<SecretResult> {
    return this.get()
      .then(res => res.json())
  }

  getValue(): Promise<string> {
    return this.getJson()
      .then(result => result.value)
  }
}

export class Key {
  #vault: KeyVault
  #name: string
  #version: string

  constructor(vault: KeyVault, name: string, varsion?: string) {
    this.#vault = vault
    this.#name = name
    this.#version = varsion || ''
  }

  version(version: string): Key {
    if (version === '') {
      return this
    } else {
      return new Key(this.#vault, this.#name, version)
    }
  }

  versions(max?: number): Promise<Response> {
    return this.#vault.fetch('GET', `/keys/${this.#name}/versions?api-version=7.3${max ? `&maxresults=${max}` : ''}`)
  }

  get(): Promise<Response> {
    return this.#vault.fetch('GET', `/keys/${this.#name}${this.#version ? `/${this.#version}` : ''}?api-version=7.3`)
  }

  getJson(): Promise<KeyResult> {
    return this.get()
      .then(res => res.json())
  }

  getKey(): Promise<JsonWebKey> {
    return this.getJson()
      .then(result => result.key)
  }

  sign(value: string, alg: string): Promise<Response> {
    return this.#vault.fetch('POST', `/keys/${this.#name}${this.#version ? `/${this.#version}` : ''}/sign?api-version=7.3`, { alg, value})
  }
}
