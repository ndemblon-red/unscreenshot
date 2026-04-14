

## Change cron job from daily to every minute

**What**: Update the `check-deadlines` cron schedule from `0 8 * * *` (once daily at 8 AM) to `* * * * *` (every minute), matching your mobile app.

**Downsides** (minimal in this case):
- **Edge function invocations**: ~1,440 calls/day instead of 1. However, the function already deduplicates via `notification_log`, so most calls will be no-ops (early return with "No due reminders" or "All already notified") costing negligible compute.
- **Database load**: Each call runs 1-2 lightweight queries. At once per minute this is trivial.
- **Cost**: Edge function invocations on Lovable Cloud's free/pro tier should handle this easily. Each no-op call takes <100ms.

**Bottom line**: No meaningful downsides. The deduplication logic is already solid, so running every minute just means notifications get logged within ~60 seconds of a deadline window opening rather than waiting until 8 AM.

### Changes

1. **Update cron schedule** (SQL via insert tool, not migration):
   - Unschedule the existing job (`cron.unschedule(1)`)
   - Create a new job with `* * * * *` schedule, same HTTP call

