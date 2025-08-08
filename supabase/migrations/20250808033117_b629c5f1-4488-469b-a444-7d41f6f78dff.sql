-- Remove the old problematic cron job that sends {"scheduled_check": true}
-- This job is causing 400 errors because the Edge Function now expects {"messageId": "<id>"}
SELECT cron.unschedule(1);