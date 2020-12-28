/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type StringList = string[];

export interface ARestic {
  repositories?:
    | {
        [k: string]: Repository;
      }
    | Repository[];
  backups?:
    | {
        [k: string]: Backup;
      }
    | Backup[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` ".+".
 */
export interface Repository {
  name?: string;
  env?: Env;
  backend?: "local" | "rest" | "sftp" | "s3" | "azure" | "gs" | "rclone";
  extends?: string;
  protocol?: "http" | "https";
  host?: string;
  username?: string;
  password?: string;
  passwordPath?: string;
  port?: number;
  path?: string;
}
export interface Env {
  /**
   * Location of repository (replaces -r)
   */
  RESTIC_REPOSITORY?: string;
  /**
   * Location of password file (replaces --password-file)
   */
  RESTIC_PASSWORD_FILE?: string;
  /**
   * The actual password for the repository
   */
  RESTIC_PASSWORD?: string;
  /**
   * Command printing the password for the repository to stdout
   */
  RESTIC_PASSWORD_COMMAND?: string;
  /**
   * ID of key to try decrypting first, before other keys
   */
  RESTIC_KEY_HINT?: string;
  /**
   * Location of the cache directory
   */
  RESTIC_CACHE_DIR?: string;
  /**
   * Frames per second by which the progress bar is updated
   */
  RESTIC_PROGRESS_FPS?: string;
  /**
   * Location for temporary files
   */
  TMPDIR?: string;
  /**
   * Amazon S3 access key ID
   */
  AWS_ACCESS_KEY_ID?: string;
  /**
   * Amazon S3 secret access key
   */
  AWS_SECRET_ACCESS_KEY?: string;
  /**
   * Amazon S3 default region
   */
  AWS_DEFAULT_REGION?: string;
  /**
   * Auth URL for keystone v1 authentication
   */
  ST_AUTH?: string;
  /**
   * Username for keystone v1 authentication
   */
  ST_USER?: string;
  /**
   * Password for keystone v1 authentication
   */
  ST_KEY?: string;
  /**
   * Auth URL for keystone authentication
   */
  OS_AUTH_URL?: string;
  /**
   * Region name for keystone authentication
   */
  OS_REGION_NAME?: string;
  /**
   * Username for keystone authentication
   */
  OS_USERNAME?: string;
  /**
   * User ID for keystone v3 authentication
   */
  OS_USER_ID?: string;
  /**
   * Password for keystone authentication
   */
  OS_PASSWORD?: string;
  /**
   * Tenant ID for keystone v2 authentication
   */
  OS_TENANT_ID?: string;
  /**
   * Tenant name for keystone v2 authentication
   */
  OS_TENANT_NAME?: string;
  /**
   * User domain name for keystone authentication
   */
  OS_USER_DOMAIN_NAME?: string;
  /**
   * User domain ID for keystone v3 authentication
   */
  OS_USER_DOMAIN_ID?: string;
  /**
   * Project name for keystone authentication
   */
  OS_PROJECT_NAME?: string;
  /**
   * Project domain name for keystone authentication
   */
  OS_PROJECT_DOMAIN_NAME?: string;
  /**
   * Project domain ID for keystone v3 authentication
   */
  OS_PROJECT_DOMAIN_ID?: string;
  /**
   * Trust ID for keystone v3 authentication
   */
  OS_TRUST_ID?: string;
  /**
   * Application Credential ID (keystone v3)
   */
  OS_APPLICATION_CREDENTIAL_ID?: string;
  /**
   * Application Credential Name (keystone v3)
   */
  OS_APPLICATION_CREDENTIAL_NAME?: string;
  /**
   * Application Credential Secret (keystone v3)
   */
  OS_APPLICATION_CREDENTIAL_SECRET?: string;
  /**
   * Storage URL for token authentication
   */
  OS_STORAGE_URL?: string;
  /**
   * Auth token for token authentication
   */
  OS_AUTH_TOKEN?: string;
  /**
   * Account ID or applicationKeyId for Backblaze B2
   */
  B2_ACCOUNT_ID?: string;
  /**
   * Account Key or applicationKey for Backblaze B2
   */
  B2_ACCOUNT_KEY?: string;
  /**
   * Account name for Azure
   */
  AZURE_ACCOUNT_NAME?: string;
  /**
   * Account key for Azure
   */
  AZURE_ACCOUNT_KEY?: string;
  /**
   * Project ID for Google Cloud Storage
   */
  GOOGLE_PROJECT_ID?: string;
  /**
   * Application Credentials for Google Cloud Storage (e.g. $HOME/.config/gs-secret-restic-key.json)
   */
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  /**
   * rclone bandwidth limit
   */
  RCLONE_BWLIMIT?: string;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` ".+".
 */
export interface Backup {
  name?: string;
  env?: Env;
  repositories?: StringList;
  snapshotByPath?: boolean;
  pathGlobs?: (string | GlobOptions)[];
  paths?: StringList;
  pathRegexes?: StringList;
  regexDateFormat?: string;
  password?: string;
  passwordPath?: string;
  globalOptions?: GlobalOptionsCli;
  options?: BackupOptionsCli;
}
export interface GlobOptions {
  patterns?: string | StringList;
  /**
   * Specifies the maximum depth of a read directory relative to the start directory
   */
  deep?: number;
  /**
   * Indicates whether to traverse descendants of symbolic link directories
   */
  followSymbolicLinks?: boolean;
  /**
   * An array of glob patterns to exclude matches. This is an alternative way to use negative patterns
   */
  ignore?: string[];
  /**
   * Mark the directory path with the final slash
   */
  markDirectories?: boolean;
  /**
   * Return only directories
   */
  onlyDirectories?: boolean;
  /**
   * Return only files
   */
  onlyFiles?: boolean;
  /**
   * Enables Bash-like brace expansion
   */
  braceExpansion?: boolean;
  /**
   * Enables a case-sensitive mode for matching files
   */
  caseSensitiveMatch?: boolean;
  /**
   * Allow patterns to match entries that begin with a period (.)
   */
  dot?: boolean;
  /**
   * Enables Bash-like extglob functionality
   */
  extglob?: boolean;
  /**
   * Enables recursively repeats a pattern containing **. If false, ** behaves exactly like *
   */
  globstar?: boolean;
  /**
   * If set to true, then patterns without slashes will be matched against the basename of the path if it contains slashes
   */
  baseNameMatch?: boolean;
  [k: string]: unknown;
}
export interface GlobalOptionsCli {
  /**
   * file to load root certificates from (default: use system certificates)
   */
  cacert?: string;
  /**
   * set the cache directory. (default: use system default cache directory)
   */
  "cache-dir"?: string;
  /**
   * auto remove old cache directories
   */
  "cleanup-cache "?: boolean;
  /**
   * set output mode to JSON for commands that support it
   */
  json?: boolean;
  /**
   * key ID of key to try decrypting first (default: $RESTIC_KEY_HINT)
   */
  "key-hint"?: string;
  /**
   * limits downloads to a maximum rate in KiB/s. (default: unlimited)
   */
  "limit-download"?: number;
  /**
   * limits uploads to a maximum rate in KiB/s. (default: unlimited)
   */
  "limit-upload"?: number;
  /**
   * do not use a local cache
   */
  "no-cache"?: boolean;
  /**
   * do not lock the repo, this allows some operations on read-only repos
   */
  "no-lock"?: boolean;
  /**
   * set extended option (key=value, can be specified multiple times)
   */
  option?: string[];
  /**
   * specify a shell command to obtain a password (default: $RESTIC_PASSWORD_COMMAND)
   */
  "password-command"?: string;
  /**
   * read the repository password from a file (default: $RESTIC_PASSWORD_FILE)
   */
  "password-file"?: string;
  /**
   * do not output comprehensive progress report
   */
  quiet?: boolean;
  /**
   * repository to backup to or restore from (default: $RESTIC_REPOSITORY)
   */
  repo?: string;
  /**
   * path to a file containing PEM encoded TLS client certificate and private key
   */
  "tls-client-cert"?: string;
  /**
   * be verbose (specify --verbose multiple times or level n)
   */
  verbose?: number;
  [k: string]: unknown;
}
export interface BackupOptionsCli {
  /**
   * exclude a pattern (can be specified multiple times)
   */
  exclude?: string[];
  /**
   * excludes cache directories that are marked with a CACHEDIR.TAG file. See http://bford.info/cachedir/spec.html for the Cache Directory Tagging Standard
   */
  "exclude-caches"?: boolean;
  /**
   * read exclude patterns from a file (can be specified multiple times)
   */
  "exclude-file"?: string[];
  /**
   * takes filename[:header], exclude contents of directories containing filename (except filename itself) if header of that file is as provided (can be specified multiple times)
   */
  "exclude-if-present"?: string;
  /**
   * read the files to backup from file (can be combined with file args/can be specified multiple times)
   */
  "files-from"?: string;
  /**
   * force re-reading the target files/directories (overrides the "parent" flag)
   */
  force?: boolean;
  /**
   * set the hostname for the snapshot manually. To prevent an expensive rescan use the "parent" flag
   */
  host?: string;
  /**
   * same as --exclude but ignores the casing of filenames
   */
  iexclude?: string[];
  /**
   * ignore inode number changes when checking for modified files
   */
  "ignore-inode"?: boolean;
  /**
   * exclude other file systems
   */
  "one-file-system"?: boolean;
  /**
   * use this parent snapshot (default: last snapshot in the repo that has the same target files/directories)
   */
  parent?: string;
  /**
   * add a tag for the new snapshot (can be specified multiple times)
   */
  tag?: string[];
  /**
   * time of the backup (ex. '2012-11-01 22:08:41') (default: now)
   */
  time?: string;
  /**
   * store the atime for all files and directories
   */
  "with-atime"?: boolean;
  [k: string]: unknown;
}
