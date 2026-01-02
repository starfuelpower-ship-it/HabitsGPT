-- Centralize habit archive/restore operations in server-side functions
-- (keeps application logic consistent and reduces ad-hoc direct updates)

CREATE OR REPLACE FUNCTION public.archive_habit(_habit_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.habits
  SET archived = true,
      updated_at = now()
  WHERE id = _habit_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Habit not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_habit(_habit_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.habits
  SET archived = false,
      updated_at = now()
  WHERE id = _habit_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Habit not found';
  END IF;
END;
$$;

-- Lock down execution so only signed-in users can call these
REVOKE ALL ON FUNCTION public.archive_habit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_habit(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.restore_habit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_habit(uuid) TO authenticated;
