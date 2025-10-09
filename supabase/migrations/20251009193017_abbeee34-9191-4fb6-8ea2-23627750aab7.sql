-- Enable real-time updates for contact_inquiries table
ALTER TABLE contact_inquiries REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE contact_inquiries;