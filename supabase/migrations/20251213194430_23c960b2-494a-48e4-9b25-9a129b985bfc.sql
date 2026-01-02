-- Add message length constraint to group_chat table
ALTER TABLE public.group_chat ADD CONSTRAINT message_length_check CHECK (char_length(message) <= 2000 AND char_length(message) >= 1);