-- Add widget-related achievements (non-punitive, optional)
INSERT INTO public.achievements (key, name, description, category, icon, is_hidden, points_reward, sort_order) VALUES
('cozy_companion_nearby', 'Cozy Companion Nearby', 'You explored the home screen widgets', 'companion', '📱', false, 5, 50),
('always_present', 'Always Present', 'Your habits and companion are never far away', 'companion', '🏠', true, 10, 51)
ON CONFLICT (key) DO NOTHING;