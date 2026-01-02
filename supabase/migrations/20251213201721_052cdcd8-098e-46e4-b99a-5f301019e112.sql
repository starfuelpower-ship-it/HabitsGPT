-- Fix 1: Add message sanitization trigger for group_chat to prevent XSS
CREATE OR REPLACE FUNCTION public.sanitize_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove potentially dangerous HTML characters
  NEW.message := regexp_replace(NEW.message, '[<>]', '', 'g');
  -- Also strip script-like patterns
  NEW.message := regexp_replace(NEW.message, '(?i)(javascript:|data:|vbscript:)', '', 'g');
  -- Ensure message is not empty after sanitization
  IF trim(NEW.message) = '' THEN
    RAISE EXCEPTION 'Message cannot be empty';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for message sanitization
DROP TRIGGER IF EXISTS sanitize_chat_message_trigger ON public.group_chat;
CREATE TRIGGER sanitize_chat_message_trigger
  BEFORE INSERT OR UPDATE ON public.group_chat
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_chat_message();

-- Fix 2: Add emoji reaction validation
CREATE OR REPLACE FUNCTION public.validate_emoji_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow common safe emoji reactions (fire, clap, muscle, sparkles, heart, thumbs up)
  IF NEW.emoji NOT IN ('🔥', '👏', '💪', '✨', '❤️', '👍', '🎉', '💯', '🙌', '⭐') THEN
    RAISE EXCEPTION 'Invalid emoji reaction';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for emoji validation
DROP TRIGGER IF EXISTS validate_emoji_trigger ON public.group_reactions;
CREATE TRIGGER validate_emoji_trigger
  BEFORE INSERT OR UPDATE ON public.group_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_emoji_reaction();