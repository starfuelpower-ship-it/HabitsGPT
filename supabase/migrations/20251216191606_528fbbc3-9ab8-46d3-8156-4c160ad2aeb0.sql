-- Clear existing achievements and insert comprehensive new set
DELETE FROM user_achievements;
DELETE FROM achievements;

-- GENTLE PROGRESS achievements
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('first_step', 'First Step', 'You completed your first habit. Every journey begins here.', 'progress', '🌱', 10, false, 1),
('back_again', 'Back Again', 'You returned and kept going. That takes courage.', 'progress', '🌿', 15, false, 2),
('slow_steady', 'Slow & Steady', 'Five habits completed at your own pace.', 'progress', '🐢', 20, false, 3),
('still_trying', 'Still Trying', 'Ten habits completed. You''re building something real.', 'progress', '💪', 25, false, 4),
('one_thing_counts', 'One Thing Counts', 'Completed at least one habit for 7 different days.', 'progress', '✨', 30, false, 5);

-- STREAK (supportive) achievements
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('on_fire', 'On Fire', 'Three days in a row. You''re warming up!', 'streak', '🔥', 15, false, 1),
('week_warrior', 'Week Warrior', 'Seven consecutive days. A full week of showing up.', 'streak', '⚔️', 30, false, 2),
('fortnight_fighter', 'Fortnight Fighter', 'Fourteen days strong. You''re building momentum.', 'streak', '🛡️', 50, false, 3),
('monthly_master', 'Monthly Master', 'Thirty days of dedication. You''ve made this a habit.', 'streak', '👑', 100, false, 4),
('century_club', 'Century Club', 'One hundred days. An incredible achievement.', 'streak', '💯', 250, false, 5);

-- REFLECTION achievements
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('quiet_moment', 'Quiet Moment', 'You wrote your first journal entry.', 'reflection', '📝', 15, false, 1),
('checking_in', 'Checking In', 'You logged how you were feeling.', 'reflection', '💭', 10, false, 2),
('deep_breath', 'Deep Breath', 'You acknowledged your stress level.', 'reflection', '🌬️', 15, false, 3),
('self_aware', 'Self Aware', 'Five journal entries. You''re getting to know yourself.', 'reflection', '🪞', 25, false, 4),
('honest_day', 'Honest Day', 'You reflected on both good and hard moments.', 'reflection', '🌤️', 20, false, 5);

-- AI-AWARE achievements
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('first_insight', 'First Insight', 'You asked for a gentle reflection.', 'ai', '💡', 15, false, 1),
('thoughtful_pause', 'Thoughtful Pause', 'You paused to read an AI reflection.', 'ai', '🤔', 20, false, 2),
('guided_growth', 'Guided Growth', 'Five gentle reflections received.', 'ai', '🌱', 30, false, 3),
('reflect_refine', 'Reflect & Refine', 'You softened a habit with AI help.', 'ai', '✏️', 25, false, 4),
('companion_mind', 'Companion Mind', 'Ten interactions with gentle support.', 'ai', '🧠', 50, false, 5);

-- COMPANION achievements
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('new_friend', 'A New Friend', 'You met your cat companion.', 'companion', '🐱', 10, false, 1),
('dressed_day', 'Dressed for the Day', 'You gave your cat their first outfit.', 'companion', '👗', 20, false, 2),
('well_loved', 'Well Loved', 'You''ve interacted with your cat many times.', 'companion', '💕', 25, false, 3),
('cozy_companion', 'Cozy Companion', 'Your cat has become part of your routine.', 'companion', '🏠', 35, false, 4),
('little_ritual', 'Little Ritual', 'You and your cat have a special bond.', 'companion', '🌟', 50, false, 5);

-- PLANT achievements
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('sprout', 'Sprout', 'Your plant has begun to grow.', 'plant', '🌱', 10, false, 1),
('taking_root', 'Taking Root', 'Your plant is getting stronger.', 'plant', '🌿', 20, false, 2),
('in_bloom', 'In Bloom', 'Your plant is blooming beautifully.', 'plant', '🌸', 35, false, 3),
('garden_keeper', 'Garden Keeper', 'You''ve nurtured growth with patience.', 'plant', '🪴', 50, false, 4),
('flourishing', 'Flourishing', 'Your garden is thriving.', 'plant', '🌳', 75, false, 5);

-- POINTS/ECONOMY achievements
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('first_rewards', 'First Rewards', 'You earned your first points.', 'economy', '🪙', 5, false, 1),
('saver', 'Saver', 'You''ve saved up 100 points.', 'economy', '💰', 15, false, 2),
('treat_yourself', 'Treat Yourself', 'You spent points on something nice.', 'economy', '🎁', 20, false, 3),
('collector', 'Collector', 'You''ve unlocked multiple items.', 'economy', '🏆', 30, false, 4),
('careful_planner', 'Careful Planner', 'You''ve managed your rewards wisely.', 'economy', '📊', 40, false, 5);

-- SECRET achievements (hidden until unlocked)
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order) VALUES
('midnight_calm', 'Midnight Calm', 'You completed a habit in the quiet hours.', 'secret', '🌙', 25, true, 1),
('early_light', 'Early Light', 'You started your day before the world woke up.', 'secret', '🌅', 25, true, 2),
('rainy_day', 'Rainy Day', 'You stayed cozy while completing habits in the rain.', 'secret', '🌧️', 20, true, 3),
('stillness', 'Stillness', 'You found peace in a quiet moment.', 'secret', '🧘', 30, true, 4),
('quiet_return', 'Quiet Return', 'You came back after time away. Welcome home.', 'secret', '🏡', 35, true, 5);

-- SEASONAL achievements (optional, cosmetic)
INSERT INTO achievements (key, name, description, category, icon, points_reward, is_hidden, sort_order, unlock_atmosphere) VALUES
('spring_bloom', 'Spring Bloom', 'You celebrated the season of new beginnings.', 'seasonal', '🌷', 20, false, 1, 'cherry_blossoms'),
('summer_glow', 'Summer Glow', 'You embraced the warmth of summer days.', 'seasonal', '☀️', 20, false, 2, 'fireflies'),
('autumn_calm', 'Autumn Calm', 'You found peace in the falling leaves.', 'seasonal', '🍂', 20, false, 3, 'autumn_leaves'),
('winter_cozy', 'Winter Cozy', 'You stayed warm through the cold season.', 'seasonal', '❄️', 20, false, 4, 'snow'),
('new_beginnings', 'New Beginnings', 'You started fresh with the new year.', 'seasonal', '🎊', 30, false, 5, NULL),
('cozy_countdown', 'Cozy Countdown', 'You ended the year with gratitude.', 'seasonal', '🎄', 30, false, 6, NULL);