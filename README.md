# Electricity Tariff Comparison Tool

A web application for comparing electricity tariffs and calculating EV charging costs.

## Features

- Compare multiple electricity tariffs based on your usage
- Calculate EV charging costs
- Customize usage assumptions
- Server-based persistence of your data across devices and browsers

## Deployment

This application is designed to be deployed on Vercel. Follow these steps to deploy it:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your Git repository to Vercel
4. Add Vercel KV (Redis) to your project:
   - From your Vercel dashboard, go to Storage
   - Add a new KV database
   - Link it to your project
5. After creating the KV database, Vercel will automatically add the required environment variables to your project:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

## Local Development

To run this project locally, you need to:

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file in the root directory with the following variables (you can get these from your Vercel project):
   ```
   KV_URL=your_kv_url
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_readonly_token
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```

## How It Works

The application uses:
- Next.js for the frontend and API routes
- Vercel KV (Redis) for data persistence across devices
- Tailwind CSS for styling
- React for the UI components

When you edit tariffs or change settings, the data is saved to Vercel KV through API endpoints, making it accessible from any browser or device. 