# @outsourc-e/revenuecat-charts

Typed, rate-aware wrapper for RevenueCat's Charts API.

## Install

```bash
pnpm add @outsourc-e/revenuecat-charts
```

## Usage

```ts
import { RevenueCatCharts } from '@outsourc-e/revenuecat-charts';

const rc = new RevenueCatCharts({
  apiKey: process.env.RC_API_KEY!,
  projectId: 'proj_123', // optional, auto-resolves from /projects when omitted
});

const overview = await rc.overview();
const revenue = await rc.charts.revenue({ resolution: 'day' });
const churn = await rc.charts.churn({ resolution: 'week' });
```

## Convenience methods

- `charts.revenue()`
- `charts.mrr()`
- `charts.mrrMovement()`
- `charts.arr()`
- `charts.activeSubscriptions()`
- `charts.activeSubscriptionsMovement()`
- `charts.activeTrials()`
- `charts.activeTrialsMovement()`
- `charts.newTrials()`
- `charts.newCustomers()`
- `charts.newPaidSubscriptions()`
- `charts.churn()`
- `charts.trialConversion()`
- `charts.initialConversion()`
- `charts.conversionToPaying()`
- `charts.subscriptionRetention()`
- `charts.subscriptionStatus()`
- `charts.refundRate()`
- `charts.appStoreRefundRequests()`
- `charts.cohortExplorer()`
- `charts.predictionExplorer()`
- `charts.realizedLtvPerCustomer()`
- `charts.realizedLtvPerPayingCustomer()`
- `charts.nonSubscriptionPurchases()`
- `charts.playStoreCancelReasons()`

## Direct chart access

```ts
await rc.chart('active_subscriptions', { resolution: 'day' });
await rc.chart('actives', { resolution: 'day' }); // same chart, canonical slug
```

Common aliases like `active_subscriptions` and `active_trials_movement` normalize automatically to the canonical API slugs used by this package.
