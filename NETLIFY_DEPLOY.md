# Netlify Deployment Guide for CoinTally

This guide will help you deploy the CoinTally frontend to Netlify.

## Prerequisites

- A Netlify account (free tier works fine)
- This GitHub repository

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account
   - Select this repository

2. **Configure Build Settings**
   - Netlify should auto-detect the settings from `netlify.toml`, but verify:
     - **Base directory**: `Frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `Frontend/.next`
     - **Node version**: `18`

3. **Environment Variables** (Optional)
   - If you have a backend API, add environment variables:
     - Click "Site settings" → "Environment variables"
     - Add: `NEXT_PUBLIC_API_URL` with your backend URL
   - If no backend, leave as is (will use placeholder from .env.production)

4. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (typically 2-5 minutes)
   - Your site will be live at: `https://[random-name].netlify.app`

5. **Custom Domain** (Optional)
   - Go to "Site settings" → "Domain management"
   - Click "Add custom domain"
   - Follow the instructions to configure your DNS

### Option 2: Deploy from CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy from the Frontend directory**
   ```bash
   cd Frontend
   netlify deploy --prod
   ```

4. **Follow the prompts**
   - Choose "Create & configure a new site" or select an existing site
   - Set the publish directory to `.next`
   - The site will be deployed

## Build Configuration

The repository includes:

- **`netlify.toml`**: Main Netlify configuration file
  - Sets build directory to `Frontend`
  - Configures build command and publish directory
  - Sets up redirects for Next.js routing
  - Adds security headers
  - Configures cache headers for static assets

- **`Frontend/public/_redirects`**: Fallback redirects for client-side routing

- **`Frontend/.env.production`**: Production environment variables

## Testing the Build Locally

Before deploying, you can test the build locally:

```bash
cd Frontend
npm install
npm run build:test
```

This will run linting and build the project to ensure everything compiles correctly.

## Expected Behavior

### ✅ What Will Work:
- All UI components and pages
- Client-side routing
- Responsive design and styling
- Static content and assets
- Web3 wallet connections (WalletConnect, MetaMask, etc.)
- Mock data from `@mock-database` (in development mode)

### ⚠️ What Won't Work (Without Backend):
- User authentication/registration
- API calls for real data
- Transaction imports from exchanges
- Blockchain data fetching
- Form generation and submissions
- Database persistence

API calls will fail gracefully with error handling, showing appropriate error messages to users.

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure Node version is 18 or higher

### 404 Errors on Page Refresh
- Check that `_redirects` file exists in `Frontend/public/`
- Verify `netlify.toml` has the correct redirect rules

### Environment Variables Not Working
- Ensure variables are prefixed with `NEXT_PUBLIC_`
- Check they're set in Netlify UI under "Site settings" → "Environment variables"
- Redeploy after adding new environment variables

### Build is Slow
- Next.js builds can take 2-5 minutes on Netlify's free tier
- Consider upgrading to a paid plan for faster builds

## Updating Your Deployment

When you push changes to your GitHub repository:
1. Netlify will automatically detect the changes
2. A new build will start automatically
3. The site will be updated when the build completes

You can also manually trigger deploys from the Netlify dashboard.

## Monitoring

- **Build logs**: Available in Netlify dashboard under "Deploys"
- **Analytics**: Available in Netlify dashboard (may require paid plan)
- **Error tracking**: Consider integrating Sentry (see `.env.production`)

## Next Steps

Once deployed, you can:
1. Test all UI pages and components
2. Verify responsive design on mobile devices
3. Set up a custom domain
4. Add analytics tracking
5. Configure error monitoring with Sentry
6. Deploy the backend separately and update `NEXT_PUBLIC_API_URL`

## Support

For Netlify-specific issues:
- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Support](https://www.netlify.com/support/)

For Next.js deployment issues:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
