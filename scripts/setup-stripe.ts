import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function setupStripe() {
  console.log('🔧 Setting up Stripe products and prices...\n');

  // Create products for each tier
  const products = {
    starter: await stripe.products.create({
      name: 'Brew & Board Starter Plan',
      description: 'Perfect for small teams - Up to 10 orders/month, email support',
      metadata: { tier: 'starter' }
    }),
    professional: await stripe.products.create({
      name: 'Brew & Board Professional Plan', 
      description: 'For growing businesses - Up to 50 orders/month, priority support, analytics',
      metadata: { tier: 'professional' }
    }),
    enterprise: await stripe.products.create({
      name: 'Brew & Board Enterprise Plan',
      description: 'Unlimited orders, dedicated account manager, custom integrations',
      metadata: { tier: 'enterprise' }
    })
  };

  console.log('✅ Products created:');
  console.log(`   Starter: ${products.starter.id}`);
  console.log(`   Professional: ${products.professional.id}`);
  console.log(`   Enterprise: ${products.enterprise.id}\n`);

  // Create prices for each product
  const prices = {
    starter: await stripe.prices.create({
      product: products.starter.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'starter' }
    }),
    professional: await stripe.prices.create({
      product: products.professional.id,
      unit_amount: 7900, // $79.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'professional' }
    }),
    enterprise: await stripe.prices.create({
      product: products.enterprise.id,
      unit_amount: 19900, // $199.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'enterprise' }
    })
  };

  console.log('✅ Prices created:');
  console.log(`   Starter: ${prices.starter.id} ($29/mo)`);
  console.log(`   Professional: ${prices.professional.id} ($79/mo)`);
  console.log(`   Enterprise: ${prices.enterprise.id} ($199/mo)\n`);

  // Create webhook endpoint
  const webhookEndpoint = await stripe.webhookEndpoints.create({
    url: 'https://brewandboard.coffee/api/webhooks/stripe',
    enabled_events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed'
    ],
    description: 'Brew & Board production webhook'
  });

  console.log('✅ Webhook endpoint created:');
  console.log(`   ID: ${webhookEndpoint.id}`);
  console.log(`   URL: ${webhookEndpoint.url}`);
  console.log(`   Secret: ${webhookEndpoint.secret}\n`);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 SAVE THESE VALUES:');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('Add to your secrets:');
  console.log(`STRIPE_WEBHOOK_SECRET=${webhookEndpoint.secret}\n`);
  
  console.log('Price IDs for payments.ts:');
  console.log(`STRIPE_PRICE_STARTER=${prices.starter.id}`);
  console.log(`STRIPE_PRICE_PROFESSIONAL=${prices.professional.id}`);
  console.log(`STRIPE_PRICE_ENTERPRISE=${prices.enterprise.id}\n`);

  console.log('═══════════════════════════════════════════════════════════');
}

setupStripe().catch(console.error);
