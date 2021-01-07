# arestic-cli
> CLI tool for automatic restic backups.

# Features
- Backup config profiles
- Backup path globs
- File config JSON/YAML format
- Auto init repositories
- Logging file
- Cross-platform

## Install

```sh
npm install -g @swordev/arestic-cli
```

## Usage

```
Usage: npx arestic [options] [command]

Options:
  -c, --config-path <value>  Config path (default: "arestic.{json,yaml,yml}:$HOME/arestic.{json,yaml,yml}")
  -h, --help                 display help for command

Commands:
  parse                      Parse config
  backup [options]           Create backups
  help [command]             display help for command
```

## Config schema

> https://github.com/swordev/arestic-cli/blob/main/arestic.schema.json

## Config examples

### Single repository

```yaml
repositories:
  local:
    backend: local
    path: /var/data/restic
backups:
  user:
    password: SECRET
    repositories:
      - local
    paths:
      - /home/user
    options:
      tag:
        - data
```

### Multiple repository

```yaml
repositories:
  remote-base:
    backend: rest
    protocol: http
    host: 127.0.0.1
    port: 8000
  remote:
    extends: remote-base
    username: username
    password: SECRET
    path: /username
  local:
    backend: local
    path: /var/data/restic
backups:
  user:
    passwordPath: /var/secret/password-restic
    repositories:
      - remote
      - local
    paths:
      - /home/user
    options:
      tag:
        - data
```

### Custom snapshot date

```yaml
repositories:
  local:
    backend: local
    path: /var/data/restic
backups:
  backups:
    repositories:
      - local
    password: SECRET
    snapshotByPath: true
    pathGlobs:
      - patterns: /var/data/backups/*
        onlyDirectories: true
    pathRegexes:
      - backup-(?<date>[\d\-]+)$
    regexDateFormat: YYYY-MM-DD-HH-mm-ss
```