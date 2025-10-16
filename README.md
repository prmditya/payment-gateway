# Simple SaaS Payment Gateway with Stripe

A Next.js application with Stripe integration for SaaS subscription payments. Features 3 pricing tiers (Basic, Pro, Enterprise) with a clean, modern UI.

## Features

- 3 pricing tiers with subscription payments
- Stripe Checkout integration
- Success page with payment confirmation
- Responsive design with Tailwind CSS
- TypeScript support
- Modern UI components

## Prerequisites

- Node.js 18+ installed
- A Stripe account (free test account works)
- pnpm (or npm/yarn)

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from: **Developers** → **API keys**
3. Create your products in: **Products** → **Add product**

#### Create Products in Stripe:

You need to create 3 products with recurring prices:

**Basic Plan:**
- Name: Basic
- Price: $10/month
- Copy the Price ID (starts with `price_`)

**Pro Plan:**
- Name: Pro
- Price: $25/month
- Copy the Price ID

**Enterprise Plan:**
- Name: Enterprise
- Price: $50/month
- Copy the Price ID

### 3. Configure Environment Variables

Update the [.env.local](.env.local) file with your Stripe keys:

```env
# Get your keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here

# Get your publishable key from https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_actual_public_key_here

# Your application URL (use http://localhost:3000 for local development)
NEXT_PUBLIC_URL=http://localhost:3000
```

### 4. Update Price IDs

Edit [src/app/pricing/page.tsx](src/app/pricing/page.tsx) and replace the `stripePriceId` values with your actual Stripe Price IDs:

```typescript
const plans = [
  {
    name: "Basic",
    stripePriceId: "price_YOUR_BASIC_PRICE_ID", // Replace this
  },
  {
    name: "Pro",
    stripePriceId: "price_YOUR_PRO_PRICE_ID", // Replace this
  },
  {
    name: "Enterprise",
    stripePriceId: "price_YOUR_ENTERPRISE_PRICE_ID", // Replace this
  },
];
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000/pricing](http://localhost:3000/pricing) to see the pricing page.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── checkout/
│   │       └── route.ts          # Stripe checkout API endpoint
│   ├── pricing/
│   │   └── page.tsx              # Pricing page with 3 tiers
│   ├── success/
│   │   └── page.tsx              # Payment success page
│   └── layout.tsx                # Root layout
├── components/
│   └── ui/
│       ├── button.tsx            # Button component
│       └── card.tsx              # Card component
└── lib/
    ├── stripe.ts                 # Stripe client configuration
    └── utils.ts                  # Utility functions
```

## Testing Payments

Stripe provides test card numbers for testing:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002

Use any future expiry date and any 3-digit CVC.

## How It Works

1. User visits [/pricing](http://localhost:3000/pricing)
2. User clicks "Get Started" on a plan
3. Frontend calls `/api/checkout` with the price ID
4. Backend creates a Stripe Checkout Session
5. User is redirected to Stripe's hosted checkout page
6. After payment, user is redirected to `/success`

## Customization

### Change Pricing

Edit [src/app/pricing/page.tsx](src/app/pricing/page.tsx):

```typescript
const plans = [
  {
    name: "Your Plan Name",
    price: "$X",
    period: "/month",
    features: ["Feature 1", "Feature 2"],
    stripePriceId: "price_xxx",
    popular: true, // Optional: adds "Most Popular" badge
  },
];
```

### Styling

The app uses Tailwind CSS. Modify classes in the component files or edit [tailwind.config.ts](tailwind.config.ts).

## Deploy to Production

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_URL` to your production domain
5. Use Stripe **live** keys (not test keys)

### Important for Production

- Switch to Stripe live mode keys
- Update success/cancel URLs to production URLs
- Set up Stripe webhooks for subscription events
- Add proper error handling and logging

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)

## License

MIT
