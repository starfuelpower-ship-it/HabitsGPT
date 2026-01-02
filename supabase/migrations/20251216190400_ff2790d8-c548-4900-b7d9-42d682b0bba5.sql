-- Clear existing achievements and add comprehensive new set
DELETE FROM achievements;

-- GENTLE PROGRESS (non-streak, supportive)
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('first_step', 'First Step', 'Completed your first habit', 'progress', '🌱', 10, false, 1),
('back_again', 'Back Again', 'Completed a habit after missing a day', 'progress', '🔄', 15, false, 2),
('slow_steady', 'Slow & Steady', 'Completed habits on 5 different days', 'progress', '🐢', 20, false, 3),
('still_trying', 'Still Trying', 'Resumed a habit after pausing', 'progress', '💪', 15, false, 4),
('one_thing_counts', 'One Thing Counts', 'Completed only one habit in a day', 'progress', '✨', 10, false, 5);

-- STREAK & CONSISTENCY (supportive language)
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('on_fire', 'On Fire', 'Reached a 3-day streak', 'streak', '🔥', 15, false, 1),
('week_warrior', 'Week Warrior', 'Reached a 7-day streak', 'streak', '⚔️', 25, false, 2),
('fortnight_fighter', 'Fortnight Fighter', 'Reached a 14-day streak', 'streak', '🛡️', 40, false, 3),
('monthly_master', 'Monthly Master', 'Reached a 30-day streak', 'streak', '👑', 75, false, 4),
('century_club', 'Century Club', 'Reached a 100-day streak', 'streak', '💎', 200, false, 5);

-- REFLECTION & EMOTIONAL
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('quiet_moment', 'Quiet Moment', 'Wrote your first journal entry', 'reflection', '📝', 15, false, 1),
('checking_in', 'Checking In', 'Logged your mood 3 times', 'reflection', '💭', 20, false, 2),
('deep_breath', 'Deep Breath', 'Used the stress slider 5 times', 'reflection', '🌬️', 20, false, 3),
('self_aware', 'Self Aware', 'Journaled on 7 different days', 'reflection', '🪞', 35, false, 4),
('honest_day', 'Honest Day', 'Logged mood + journal on the same day', 'reflection', '🌸', 15, false, 5);

-- AI-AWARE (premium features)
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('first_insight', 'First Insight', 'Received your first AI reflection', 'ai', '💡', 20, false, 1),
('thoughtful_pause', 'Thoughtful Pause', 'Asked AI for habit guidance', 'ai', '🤔', 20, false, 2),
('guided_growth', 'Guided Growth', 'Used AI suggestions 5 times', 'ai', '🌿', 35, false, 3),
('reflect_refine', 'Reflect & Refine', 'Applied an AI insight to a habit', 'ai', '🔮', 25, false, 4),
('companion_mind', 'Companion Mind', 'Used AI journaling across 7 days', 'ai', '🧠', 50, false, 5);

-- COMPANION & COZY
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('new_friend', 'A New Friend', 'Visited the rewards store', 'companion', '🐱', 10, false, 1),
('dressed_day', 'Dressed for the Day', 'Equipped your first outfit', 'companion', '👔', 15, false, 2),
('well_loved', 'Well Loved', 'Changed the cat''s outfit 5 times', 'companion', '💕', 25, false, 3),
('cozy_companion', 'Cozy Companion', 'Opened the app on 7 different days', 'companion', '🏠', 20, false, 4),
('little_ritual', 'Little Ritual', 'Interacted with the cat on 10 days', 'companion', '🎀', 30, false, 5);

-- PLANT & GROWTH
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('sprout', 'Sprout', 'Reached first plant growth stage', 'plant', '🌱', 15, false, 1),
('taking_root', 'Taking Root', 'Grew 3 different plants', 'plant', '🌿', 30, false, 2),
('in_bloom', 'In Bloom', 'Fully grew one plant', 'plant', '🌸', 40, false, 3),
('garden_keeper', 'Garden Keeper', 'Maintained growth for 14 days', 'plant', '🧑‍🌾', 50, false, 4),
('flourishing', 'Flourishing', 'Sustained plant growth through consistency', 'plant', '🌳', 75, false, 5);

-- POINTS & ECONOMY
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('first_rewards', 'First Rewards', 'Earned your first points', 'economy', '🪙', 5, false, 1),
('saver', 'Saver', 'Accumulated 100 points', 'economy', '💰', 15, false, 2),
('treat_yourself', 'Treat Yourself', 'Spent points for the first time', 'economy', '🎁', 10, false, 3),
('collector', 'Collector', 'Unlocked 5 cosmetic items', 'economy', '🏆', 30, false, 4),
('careful_planner', 'Careful Planner', 'Earned points across 5 separate days', 'economy', '📊', 25, false, 5);

-- SECRET / DISCOVERY (hidden achievements)
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('midnight_calm', 'Midnight Calm', 'Used the app late at night', 'secret', '🌙', 15, true, 1),
('early_light', 'Early Light', 'Completed a habit in the morning', 'secret', '🌅', 15, true, 2),
('rainy_day', 'Rainy Day', 'Completed habits with rain ambience', 'secret', '🌧️', 20, true, 3),
('stillness', 'Stillness', 'Spent 5 minutes in the app peacefully', 'secret', '🧘', 25, true, 4),
('quiet_return', 'Quiet Return', 'Came back after 7 days away', 'secret', '🦋', 30, true, 5);