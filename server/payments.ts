import Stripe from 'stripe';
import type { Express, Request, Response } from 'express';
import { db } from './db';
import { subscriptions, payments, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const STRIPE_PRICES: Record<string, { monthly: number; tier: string }> = {
  starter: { monthly: 2900, tier: 'starter' },
  professional: { monthly: 7900, tier: 'professional' },
  enterprise: { monthly: 19900, tier: 'enterprise' }
};

export function registerPaymentRoutes(app: Express) {
  app.get('/api/config/stripe', (req, res) => {
    res.json({ 
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
      isConfigured: !!process.env.STRIPE_SECRET_KEY 
    });
  });

  app.get('/api/config/coinbase', (req, res) => {
    res.json({ 
      isConfigured: !!process.env.COINBASE_COMMERCE_API_KEY 
    });
  });

  app.post('/api/payments/create-subscription-checkout', async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured' });
      }

      const { userId, tier, successUrl, cancelUrl } = req.body;
      
      if (!userId || !tier) {
        return res.status(400).json({ error: 'userId and tier are required' });
      }

      const priceConfig = STRIPE_PRICES[tier];
      if (!priceConfig) {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let stripeCustomerId: string | undefined;
      const [existingSub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
      
      if (existingSub?.stripeCustomerId) {
        stripeCustomerId = existingSub.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id }
        });
        stripeCustomerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Brew & Board ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `Monthly subscription for Brew & Board ${tier} tier`
            },
            unit_amount: priceConfig.monthly,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        automatic_tax: { enabled: true },
        customer_update: {
          address: 'auto'
        },
        subscription_data: {
          trial_period_days: 14,
          metadata: { userId, tier }
        },
        success_url: successUrl || `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/pricing`,
        metadata: { userId, tier, type: 'subscription' }
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payments/create-order-checkout', async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured' });
      }

      const { userId, orderId, amount, description, successUrl, cancelUrl } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount are required' });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const amountInCents = Math.round(parseFloat(amount) * 100);

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Brew & Board Order',
              description: description || 'Coffee delivery order'
            },
            unit_amount: amountInCents
          },
          quantity: 1
        }],
        automatic_tax: { enabled: true },
        shipping_address_collection: {
          allowed_countries: ['US']
        },
        success_url: successUrl || `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.origin}/schedule`,
        metadata: { userId, orderId: orderId || '', type: 'order' }
      });

      await db.insert(payments).values({
        userId,
        orderId: orderId || null,
        provider: 'stripe',
        providerSessionId: session.id,
        amount: amount.toString(),
        status: 'pending'
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe order checkout error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payments/create-coinbase-checkout', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Coinbase Commerce is not configured. Please add COINBASE_COMMERCE_API_KEY to secrets.' });
      }

      const { userId, amount, description, orderId, successUrl, cancelUrl } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount are required' });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const response = await fetch('https://api.commerce.coinbase.com/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': apiKey,
          'X-CC-Version': '2018-03-22'
        },
        body: JSON.stringify({
          name: 'Brew & Board Order',
          description: description || 'Coffee delivery order',
          pricing_type: 'fixed_price',
          local_price: {
            amount: amount.toString(),
            currency: 'USD'
          },
          metadata: {
            userId,
            orderId: orderId || ''
          },
          redirect_url: successUrl || `${req.headers.origin}/payment-success`,
          cancel_url: cancelUrl || `${req.headers.origin}/schedule`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create Coinbase charge');
      }

      const data = await response.json();
      
      await db.insert(payments).values({
        userId,
        orderId: orderId || null,
        provider: 'coinbase',
        providerPaymentId: data.data.code,
        amount: amount.toString(),
        status: 'pending'
      });

      res.json({ 
        chargeId: data.data.code,
        url: data.data.hosted_url 
      });
    } catch (error: any) {
      console.error('Coinbase checkout error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/webhooks/stripe', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!stripe || !sig) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    let event: Stripe.Event;
    
    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = req.body as Stripe.Event;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        
        if (metadata.type === 'subscription' && metadata.userId && metadata.tier) {
          await db.insert(subscriptions).values({
            userId: metadata.userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            tier: metadata.tier,
            status: 'active'
          }).onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              tier: metadata.tier,
              status: 'active',
              updatedAt: new Date()
            }
          });
        }
        
        if (session.id) {
          await db.update(payments)
            .set({ 
              status: 'completed', 
              providerPaymentId: session.payment_intent as string,
              updatedAt: new Date()
            })
            .where(eq(payments.providerSessionId, session.id));
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subData = subscription as any;
        await db.update(subscriptions)
          .set({
            status: subscription.status === 'active' ? 'active' : 
                   subscription.status === 'past_due' ? 'past_due' : 
                   subscription.status === 'trialing' ? 'trialing' : 'canceled',
            currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start * 1000) : undefined,
            currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : undefined,
            updatedAt: new Date()
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await db.update(subscriptions)
          .set({ status: 'canceled', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }
    }

    res.json({ received: true });
  });

  app.post('/api/webhooks/coinbase', async (req: Request, res: Response) => {
    try {
      const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
      const signature = req.headers['x-cc-webhook-signature'] as string;
      
      if (webhookSecret && signature) {
        const crypto = await import('crypto');
        const expectedSignature = crypto.createHmac('sha256', webhookSecret)
          .update(JSON.stringify(req.body))
          .digest('hex');
        
        if (signature !== expectedSignature) {
          console.error('Coinbase webhook signature mismatch');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }
      
      const event = req.body;
      
      if (event.type === 'charge:confirmed' || event.type === 'charge:resolved') {
        const chargeCode = event.data?.code;
        if (chargeCode) {
          await db.update(payments)
            .set({ status: 'completed', updatedAt: new Date() })
            .where(eq(payments.providerPaymentId, chargeCode));
        }
      } else if (event.type === 'charge:failed') {
        const chargeCode = event.data?.code;
        if (chargeCode) {
          await db.update(payments)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(payments.providerPaymentId, chargeCode));
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Coinbase webhook error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/subscriptions/:userId', async (req: Request, res: Response) => {
    try {
      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, req.params.userId));
      
      res.json(subscription || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/subscriptions/:userId/cancel', async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: 'Stripe is not configured' });
      }

      const [subscription] = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, req.params.userId));
      
      if (!subscription?.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      
      await db.update(subscriptions)
        .set({ status: 'canceled', updatedAt: new Date() })
        .where(eq(subscriptions.userId, req.params.userId));
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/payments/:userId', async (req: Request, res: Response) => {
    try {
      const userPayments = await db.select()
        .from(payments)
        .where(eq(payments.userId, req.params.userId));
      
      res.json(userPayments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
