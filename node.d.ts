// filepath: /workspaces/project-dashat/environment.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    S3_ACCESS_KEY_ID: string
    S3_SECRET_ACCESS_KEY: string
    S3_ENDPOINT: string
    S3_BUCKET: string
    S3_REGION: string
    DB_DEBUG: string
  }
}
