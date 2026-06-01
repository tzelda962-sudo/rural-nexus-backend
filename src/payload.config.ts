import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Documents } from './collections/Documents'
import { Programs } from './collections/Programs'
import { NewsEvents } from './collections/NewsEvents'
import { Team } from './collections/Team'
import { FeaturedVolunteers } from './collections/FeaturedVolunteers'
import { Stories } from './collections/Stories'
import { Gallery } from './collections/Gallery'
import { ImpactMetrics } from './collections/ImpactMetrics'
import { HomepageTestimonials } from './collections/HomepageTestimonials'
import { VolunteerStats } from './collections/VolunteerStats'
import { ContactInquiries } from './collections/ContactInquiries'
import { Publications } from './collections/Publications'
import { Partners } from './collections/Partners'

import {
  SiteSettings,
  HomePage,
  AboutPage,
  ProgramsPage,
  ProgramDetailPage,
  InitiativeDetailPage,
  ProjectsPage,
  PublicationsPage,
  NewsPage,
  StoriesPage,
  StoryDetailPage,
  GalleryPage,
  ImpactPage,
  ResearchPage,
  ContactPage,
  NewsEventDetailPage,
} from './globals'

import { keepAliveEndpoint } from './endpoints/keepAlive'
import { contactEndpoint } from './endpoints/contact'
import { listInitiativesEndpoint, getInitiativeEndpoint } from './endpoints/initiatives'
import { searchEndpoint } from './endpoints/search'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const frontendOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default buildConfig({
  serverURL: serverUrl,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Documents,
    Programs,
    NewsEvents,
    Team,
    FeaturedVolunteers,
    Stories,
    Gallery,
    ImpactMetrics,
    HomepageTestimonials,
    VolunteerStats,
    ContactInquiries,
    Publications,
    Partners,
  ],
  globals: [
    SiteSettings,
    HomePage,
    AboutPage,
    ProgramsPage,
    ProgramDetailPage,
    InitiativeDetailPage,
    EventsPage,
    StoriesPage,
    StoryDetailPage,
    GalleryPage,
    ImpactPage,
    ResearchPage,
    ContactPage,
    NewsEventDetailPage,
  ],
  endpoints: [
    keepAliveEndpoint,
    contactEndpoint,
    listInitiativesEndpoint,
    getInitiativeEndpoint,
    searchEndpoint,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // push:true syncs schema changes (new tables/columns) directly to the DB
    // without requiring explicit migration files. Safe for additive changes.
    push: true,
  }),
  cors: frontendOrigins,
  csrf: frontendOrigins,
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
        documents: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
