import { config } from '#src/config/config.ts';
import { resend } from '#src/lib/resend.ts';
import { prisma } from '@repo/database';
import { ResetPassword, VerifyEmail } from '@repo/email';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI } from 'better-auth/plugins';
import { claimRecipeBookInvites } from '../users/userUtils.ts';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: 'Pangea Recipes <auth@notify.pangearecipes.com>',
        to: user.email,
        subject: `Reset your password`,
        replyTo: 'hello@pangearecipes.com',
        react: ResetPassword({
          url: url,
        }),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ url, user }) => {
      await resend.emails.send({
        from: 'Pangea Recipes <auth@notify.pangearecipes.com>',
        to: user.email,
        subject: `Verify your email address`,
        replyTo: 'hello@pangearecipes.com',
        react: VerifyEmail({
          url: url,
        }),
      });
    },
  },
  plugins: [openAPI()],
  basePath: '/auth',
  baseURL:
    config.NODE_ENV === 'production'
      ? 'https://api.pangearecipes.com'
      : 'http://localhost:3001',
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://pangearecipes.com',
    'https://www.pangearecipes.com',
    'https://next.pangearecipes.com',
    'https://api.pangearecipes.com',
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        config.NODE_ENV === 'production' ? '.pangearecipes.com' : 'localhost',
    },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    },
    database: {
      generateId: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      accessRole: {
        type: 'string',
        required: true,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      clientId: config.FACEBOOK_APP_ID,
      clientSecret: config.FACEBOOK_APP_SECRET,
    },
  },
  secret: config.BETTER_AUTH_SECRET,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await claimRecipeBookInvites(user);
        },
      },
    },
  },
});
