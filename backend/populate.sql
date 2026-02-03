-- Insert 10 users
INSERT INTO user (username, firstname, lastname, email, password_hash) VALUES
('User01','Alice', 'Johnson','user01@example.com', '$2b$12$5eBcLX9DEon1DsUzH6luUeIqYpS0GhDK1exwKrG/TPZhLkpXv8CA6'),
('User02','Bob', 'Smith','user02@example.com', '$2b$12$3kCuLcHo9nXAGmIwEWb2K.ySC1A0JOrsjANWmHJ9WiyTlLk0oSvWy'),
('User03','Charlie', 'Brown', 'user03@example.com', '$2b$12$KaxbIN/0540z6iZ5vVpj0.yDr6HbBCJAMYUyxVZ7GPJPtYJdvYXAC'),
('User04','Diana', 'Miller','user04@example.com', '$2b$12$sNbSidxLDwEp9sECVVPFOOop1q/XrQaeFQHjP8gFYkMdQHEWGnWu2'),
('User05','Edward', 'Wilson', 'user05@example.com', '$2b$12$d7b1Kc6lEmHMZdMWuY3FIO.ZTfClzPpFbsbG5Xzhjo0nWt2Hh81JO'),
('User06','Fiona', 'Clark','user06@example.com', '$2b$12$mUS6A7gnjYUXQvUlv0LfE.4HFhB3FeG/.VZzA5yxwtOAvjQSxx5Me'),
('User07','George', 'Anderson','user07@example.com','$2b$12$k4LnVnYfuJWIoBjrdniDguX74gKSD7BpRiljJb7HywiQYctWOQadm'),
('User08','Hannah', 'Taylor','user08@example.com','$2b$12$gh8Zw619fi94hNADo2.c4uZzuEAc94LLIcZWLcd0EvdjQbW/K/0L2'),
('User09','Ian', 'Moore', 'user09@example.com','$2b$12$LAwgU4NGFWu/v32eg/ryOO14WCgn89rOsNrLvAmziD.5t2HMi6Tze'),
('User10','Jane', 'Lee','user10@example.com','$2b$12$XeyBncLYDMCPTd5PzzwBFOb62nsqunC4hxHqTvd755U5NowXGa.Q2');


INSERT INTO income (user_id, amount, frequency, comment) VALUES
(1, 5000.00, 'monthly', 'Main job'),   -- Alice's net monthly income
(2, 4000.00, 'monthly' ,'Main job'),   -- Bob's net monthly income
(3, 3500.00, 'monthly', 'Main job');   -- Charlie's net monthly income

-- Insert 10 goals (1 for each user)
    INSERT INTO goals (user_id, description, amount, target_date, completed) VALUES
(1, 'Trip to Japan', 5000.00, '2025-11-01', FALSE),
(1,'Trip to Europe',10000.00,'2025-12-01', FALSE),
(2, 'New Laptop', 1500.00, '2025-12-15', FALSE),
(3, 'Emergency Fund', 3000.00, '2025-10-01', FALSE),
(4, 'Wedding', 10000.00, '2026-06-01' ,FALSE),
(5, 'Car Down Payment', 7000.00, '2025-09-01', FALSE),
(6, 'Home Renovation', 8000.00, '2026-01-10', FALSE),
(7, 'Birthday Party', 1200.00, '2025-08-15', FALSE),
(8, 'Education Fund', 9000.00, '2026-02-20', FALSE),
(9, 'New Phone', 1200.00, '2025-07-30', FALSE),
(10, 'Camera', 2000.00, '2025-12-01', FALSE);


-- Insert 10 savings contributions (1 for each goal)
INSERT INTO savings (goal_id, amount,date) VALUES
(1, 500.00,'2025-07-01'),
(2, 200.00,'2025-07-07'),
(3, 300.00,'2025-07-14'),
(4, 1000.00,'2025-07-01'),
(5, 700.00,'2025-07-07'),
(6, 800.00,'2025-07-14'),
(7, 150.00,'2025-07-01'),
(8, 900.00,'2025-07-07'),
(9, 100.00,'2025-07-14'),
(10, 250.00,'2025-07-01');

INSERT INTO categories (cat_name) VALUES
-- Lifestyle
('Subscriptions'),
('Dining'),
('Alcohol'),
('Entertainment'),
('Hobbies & Craft'),
('Shopping'),
('Coffee & Cafe'),
('Uber'),
('Fuel'),
('Parking fee'),
('Public transport'),
('Groceries'),
('Personal Care'),
('Gym membership'),
('Supplements'),
('Home decor'),
('Pet treats'),
('Vet Bills');

-- Fixed expenses for User01 (Alice)
INSERT INTO fixedexpenses (user_id, name, amount, biling_cycle)
VALUES
(1, 'Rent', 2000.00, 'monthly'),
(1, 'Power', 150.00, 'monthly'),
(1, 'Internet', 90.00, 'monthly'),
(1, 'Health Insurance', 80.00, 'monthly');

-- Fixed expenses for User02 (Bob)
INSERT INTO fixedexpenses (user_id, name, amount, biling_cycle)
VALUES
(2, 'Rent', 1000.00, 'monthly'),
(2, 'Power', 90.00, 'monthly'),
(2, 'Mobile Plan', 40.00, 'monthly'),
(2, 'Car Insurance', 75.00, 'monthly');

-- Fixed expenses for User03 (Charlie)
INSERT INTO fixedexpenses (user_id, name, amount, biling_cycle)
VALUES
(3, 'Rent', 950.00, 'monthly'),
(3, 'Internet', 55.00, 'monthly'),
(3, 'Power', 95.00, 'monthly'),
(3, 'Health Insurance', 70.00, 'monthly');

-- Expenses for User01 (Alice)
INSERT into expenses (user_id, amount, category_id, date, description)
VALUES
(1, 50.00, 9, '2025-05-10', 'weekly fuel fill up'),
(1, 30.00, 2, '2025-05-12', 'celebration dinner'),
(1, 50.00, 9, '2025-05-17', 'gas station refuel'),
(1, 50.00, 9, '2025-05-24', 'fuel for weekend trip'),
(1, 50.00, 9, '2025-06-09', 'tank refill'),
(1, 50.00, 9, '2025-06-24', 'gas for commute'),
(1, 50.00, 9, '2025-06-14', 'fuel top up'),
(1, 6.00, 7, '2025-06-04', 'morning coffee'),
(1, 6.00, 7, '2025-06-10', 'espresso break'),
(1, 6.00, 7, '2025-06-12', 'latte treat'),
(1, 6.00, 7, '2025-06-14', 'cappuccino'),
(1, 6.00, 7, '2025-06-16', 'weekend coffee'),
(1, 6.00, 7, '2025-06-18', 'afternoon pick me up'),
(1, 5.50, 7, '2025-06-24', 'iced coffee'),
(1, 6.00, 7, '2025-07-01', 'start of month coffee'),
(1, 6.00, 7, '2025-07-04', 'holiday coffee'),
(1, 100.00, 12, '2025-05-13', 'weekly grocery shopping'),
(1, 100.00, 12, '2025-05-24', 'monthly grocery run'),
(1, 50.00, 12, '2025-05-30', 'fresh produce'),
(1, 80.00, 12, '2025-06-10', 'pantry essentials'),
(1, 22.00, 12, '2025-06-13', 'quick grocery stop'),
(1, 40.00, 12, '2025-06-21', 'dairy and bread'),
(1, 10.00, 12, '2025-06-22', 'snacks and drinks'),
-- Additional September 2025 expenses for User01 (Alice) - moved from October for current month testing
(1, 45.00, 9, '2025-09-01', 'monthly fuel fill up'),
(1, 8.50, 7, '2025-09-02', 'morning coffee'),
(1, 120.00, 12, '2025-09-03', 'weekly grocery shopping'),
(1, 65.00, 2, '2025-09-04', 'dinner with friends'),
(1, 25.00, 8, '2025-09-05', 'uber ride home'),
(1, 6.00, 7, '2025-09-06', 'weekend coffee'),
(1, 85.00, 4, '2025-09-07', 'movie tickets'),
(1, 45.00, 9, '2025-09-08', 'gas station refuel'),
(1, 7.00, 7, '2025-09-09', 'espresso break'),
(1, 150.00, 12, '2025-09-10', 'monthly grocery run'),
(1, 35.00, 2, '2025-09-11', 'lunch out'),
(1, 12.00, 10, '2025-09-12', 'parking downtown'),
(1, 6.50, 7, '2025-09-13', 'iced coffee'),
(1, 200.00, 6, '2025-09-14', 'shopping spree'),
(1, 50.00, 9, '2025-09-15', 'fuel for weekend trip'),
(1, 8.00, 7, '2025-09-16', 'cappuccino'),
(1, 90.00, 2, '2025-09-17', 'birthday dinner'),
(1, 30.00, 3, '2025-09-18', 'weekend drinks'),
(1, 6.00, 7, '2025-09-19', 'morning coffee'),
(1, 75.00, 12, '2025-09-20', 'pantry essentials'),
(1, 40.00, 8, '2025-09-21', 'airport transfer'),
(1, 45.00, 9, '2025-09-22', 'gas fill up'),
(1, 7.50, 7, '2025-09-23', 'latte treat'),
(1, 180.00, 4, '2025-09-24', 'concert tickets'),
(1, 55.00, 1, '2025-09-25', 'netflix subscription'),
(1, 50.00, 9, '2025-09-26', 'weekend fuel'),
(1, 6.00, 7, '2025-09-27', 'afternoon coffee'),
(1, 110.00, 12, '2025-09-28', 'organic groceries'),
(1, 70.00, 2, '2025-09-29', 'restaurant dinner'),
(1, 15.00, 10, '2025-09-30', 'event parking')
;

-- Expenses for User02 (Bob)
INSERT into expenses (user_id, amount, category_id, date, description)
VALUES
(2, 45.00, 3, '2025-01-15', 'weekend drinks'),
(2, 120.00, 4, '2025-02-08', 'movie night'),
(2, 85.00, 5, '2025-03-22', 'art supplies'),
(2, 200.00, 6, '2025-04-12', 'clothing'),
(2, 8.50, 7, '2025-05-03', 'morning coffee'),
(2, 25.00, 8, '2025-06-18', 'ride home'),
(2, 65.00, 9, '2025-07-25', 'gas station'),
(2, 12.00, 10, '2025-08-09', 'parking downtown'),
(2, 35.00, 11, '2025-09-14', 'bus fare'),
(2, 150.00, 12, '2025-10-28', 'weekly groceries'),
(2, 45.00, 13, '2025-11-05', 'haircut'),
(2, 80.00, 14, '2025-12-12', 'gym membership'),
(2, 30.00, 15, '2025-01-30', 'vitamins'),
(2, 75.00, 16, '2025-02-17', 'home decoration'),
(2, 15.00, 17, '2025-03-08', 'dog treats'),
(2, 120.00, 18, '2025-04-21', 'vet checkup'),
(2, 55.00, 1, '2025-05-16', 'netflix subscription'),
(2, 90.00, 2, '2025-06-29', 'dinner out'),
(2, 40.00, 3, '2025-07-11', 'beer'),
(2, 180.00, 4, '2025-08-24', 'concert tickets'),
(2, 60.00, 5, '2025-09-07', 'hobby materials'),
(2, 110.00, 6, '2025-10-19', 'shopping spree'),
(2, 7.00, 7, '2025-11-30', 'espresso'),
(2, 18.00, 8, '2025-12-03', 'uber ride'),
-- September 2025 expenses for User02 (Bob) - for testing different tip scenarios
(2, 200.00, 6, '2025-09-01', 'shopping spree'),
(2, 150.00, 2, '2025-09-02', 'fine dining'),
(2, 80.00, 3, '2025-09-03', 'weekend drinks'),
(2, 300.00, 4, '2025-09-04', 'concert tickets'),
(2, 120.00, 5, '2025-09-05', 'hobby supplies'),
(2, 250.00, 6, '2025-09-06', 'electronics purchase'),
(2, 60.00, 2, '2025-09-07', 'restaurant dinner'),
(2, 40.00, 3, '2025-09-08', 'bar night'),
(2, 180.00, 4, '2025-09-09', 'theater show'),
(2, 90.00, 2, '2025-09-10', 'lunch meeting'),
(2, 50.00, 3, '2025-09-11', 'wine tasting'),
(2, 220.00, 6, '2025-09-12', 'clothing shopping'),
(2, 70.00, 2, '2025-09-13', 'dinner out'),
(2, 30.00, 3, '2025-09-14', 'cocktails'),
(2, 160.00, 4, '2025-09-15', 'movie marathon'),
(2, 100.00, 2, '2025-09-16', 'business dinner'),
(2, 45.00, 3, '2025-09-17', 'beer with friends'),
(2, 190.00, 6, '2025-09-18', 'furniture purchase'),
(2, 55.00, 2, '2025-09-19', 'lunch'),
(2, 35.00, 3, '2025-09-20', 'weekend drinks'),
(2, 140.00, 4, '2025-09-21', 'comedy show'),
(2, 75.00, 2, '2025-09-22', 'dinner'),
(2, 25.00, 3, '2025-09-23', 'happy hour'),
(2, 280.00, 6, '2025-09-24', 'gadget purchase'),
(2, 65.00, 2, '2025-09-25', 'restaurant'),
(2, 50.00, 3, '2025-09-26', 'wine night'),
(2, 200.00, 4, '2025-09-27', 'music festival'),
(2, 85.00, 2, '2025-09-28', 'brunch'),
(2, 40.00, 3, '2025-09-29', 'drinks'),
(2, 110.00, 6, '2025-09-30', 'shopping')
;

-- Expenses for User03 (Charlie)
INSERT into expenses (user_id, amount, category_id, date, description)
VALUES
(3, 35.00, 2, '2025-01-08', 'lunch with friends'),
(3, 95.00, 4, '2025-02-14', 'valentine dinner'),
(3, 70.00, 5, '2025-03-25', 'craft supplies'),
(3, 180.00, 6, '2025-04-18', 'new shoes'),
(3, 9.00, 7, '2025-05-07', 'latte'),
(3, 22.00, 8, '2025-06-22', 'taxi'),
(3, 55.00, 9, '2025-07-14', 'fuel'),
(3, 8.00, 10, '2025-08-31', 'parking'),
(3, 28.00, 11, '2025-09-12', 'train ticket'),
(3, 130.00, 12, '2025-10-25', 'grocery shopping'),
(3, 50.00, 13, '2025-11-18', 'spa treatment'),
(3, 75.00, 14, '2025-12-08', 'fitness class'),
(3, 25.00, 15, '2025-01-21', 'supplements'),
(3, 60.00, 16, '2025-02-28', 'cushions'),
(3, 12.00, 17, '2025-03-15', 'cat food'),
(3, 95.00, 18, '2025-04-09', 'pet vaccination'),
(3, 45.00, 1, '2025-05-26', 'spotify premium'),
(3, 110.00, 2, '2025-06-11', 'restaurant'),
(3, 30.00, 3, '2025-07-29', 'wine'),
(3, 160.00, 4, '2025-08-16', 'theater show'),
(3, 80.00, 5, '2025-09-23', 'painting supplies'),
(3, 140.00, 6, '2025-10-07', 'electronics'),
(3, 6.50, 7, '2025-11-14', 'cappuccino'),
(3, 20.00, 8, '2025-12-21', 'ride share')
;

-- Expenses for User04 (Diana)
INSERT into expenses (user_id, amount, category_id, date, description)
VALUES
(4, 65.00, 1, '2025-01-12', 'amazon prime'),
(4, 85.00, 2, '2025-02-19', 'birthday dinner'),
(4, 40.00, 3, '2025-03-06', 'cocktails'),
(4, 120.00, 4, '2025-04-30', 'comedy show'),
(4, 95.00, 5, '2025-05-14', 'sewing materials'),
(4, 220.00, 6, '2025-06-27', 'designer bag'),
(4, 8.00, 7, '2025-07-09', 'iced coffee'),
(4, 35.00, 8, '2025-08-22', 'airport transfer'),
(4, 70.00, 9, '2025-09-05', 'gas fill up'),
(4, 15.00, 10, '2025-10-18', 'event parking'),
(4, 42.00, 11, '2025-11-29', 'monthly pass'),
(4, 160.00, 12, '2025-12-15', 'organic groceries'),
(4, 75.00, 13, '2025-01-28', 'manicure'),
(4, 90.00, 14, '2025-02-11', 'yoga membership'),
(4, 35.00, 15, '2025-03-24', 'protein powder'),
(4, 85.00, 16, '2025-04-07', 'wall art'),
(4, 18.00, 17, '2025-05-20', 'pet toys'),
(4, 140.00, 18, '2025-06-13', 'emergency vet'),
(4, 55.00, 1, '2025-07-26', 'disney plus'),
(4, 130.00, 2, '2025-08-09', 'fine dining'),
(4, 50.00, 3, '2025-09-17', 'champagne'),
(4, 200.00, 4, '2025-10-03', 'music festival'),
(4, 110.00, 5, '2025-11-21', 'knitting supplies'),
(4, 180.00, 6, '2025-12-08', 'jewelry'),
(4, 7.50, 7, '2025-01-15', 'mocha'),
(4, 28.00, 8, '2025-02-28', 'late night ride')
;

-- What-if Scenarios for Users 01, 02, and 03

-- Scenario 1: User01 (Alice)
INSERT INTO whatifscenario (user_id, goal_id, name, created_at) VALUES
(1, 1, 'Budget Optimization for Japan Trip', '2025-07-15 10:30:00');

INSERT INTO whatifadjustment (scenario_id, category_id, original_amt, new_amt, note) VALUES
(1, 7, 50.00, 20.00, 'Reduced coffee spending from $50 to $20'),
(1, 9, 200.00, 120.00, 'Reduced fuel costs from $200 to $120'),
(1, 6, 200.00, 100.00, 'Reduced shopping from $200 to $100'),
(1, 2, 70.00, 40.00, 'Reduced dining out from $70 to $40');

-- Scenario 2: User02 (Bob) 
INSERT INTO whatifscenario (user_id, goal_id, name, created_at) VALUES
(2, 3, 'Entertainment Cutback for New Laptop', '2025-07-20 14:15:00');

INSERT INTO whatifadjustment (scenario_id, category_id, original_amt, new_amt, note) VALUES
(2, 4, 300.00, 150.00, 'Reduced entertainment from $300 to $150'),
(2, 2, 150.00, 80.00, 'Reduced dining from $150 to $80'),
(2, 6, 250.00, 120.00, 'Reduced shopping from $250 to $120'),
(2, 3, 80.00, 40.00, 'Reduced alcohol spending from $80 to $40');

-- Scenario 3: User03 (Charlie) 
INSERT INTO whatifscenario (user_id, goal_id, name, created_at) VALUES
(3, 4, 'Lifestyle Adjustment for Emergency Fund', '2025-07-25 09:45:00');

INSERT INTO whatifadjustment (scenario_id, category_id, original_amt, new_amt, note) VALUES
(3, 2, 110.00, 70.00, 'Reduced dining from $110 to $70'),
(3, 4, 160.00, 100.00, 'Reduced entertainment from $160 to $100'),
(3, 6, 140.00, 90.00, 'Reduced shopping from $140 to $90'),
(3, 5, 80.00, 50.00, 'Reduced hobbies from $80 to $50'),
(3, 13, 50.00, 30.00, 'Reduced personal care from $50 to $30');

-- Scenario 4: User01 (Alice) - Aggressive Savings for Europe Trip
INSERT INTO whatifscenario (user_id, goal_id, name, created_at) VALUES
(1, 2, 'Aggressive Savings Plan for Europe Trip', '2025-08-01 16:20:00');

INSERT INTO whatifadjustment (scenario_id, category_id, original_amt, new_amt, note) VALUES
(4, 7, 50.00, 15.00, 'Drastically reduced coffee spending from $50 to $15'),
(4, 2, 70.00, 25.00, 'Minimal dining out from $70 to $25'),
(4, 6, 200.00, 50.00, 'Significantly reduced shopping from $200 to $50'),
(4, 4, 180.00, 60.00, 'Reduced entertainment from $180 to $60'),
(4, 9, 200.00, 100.00, 'Cut fuel costs in half from $200 to $100'),
(4, 12, 150.00, 100.00, 'Reduced grocery budget from $150 to $100');

-- Scenario 5: User02 (Bob) - Moderate Cutback for Laptop Goal
INSERT INTO whatifscenario (user_id, goal_id, name, created_at) VALUES
(2, 3, 'Moderate Lifestyle Changes for Laptop', '2025-08-05 11:10:00');

INSERT INTO whatifadjustment (scenario_id, category_id, original_amt, new_amt, note) VALUES
(5, 4, 300.00, 200.00, 'Moderate entertainment reduction from $300 to $200'),
(5, 2, 150.00, 100.00, 'Reduced dining from $150 to $100'),
(5, 6, 250.00, 180.00, 'Slight shopping reduction from $250 to $180'),
(5, 3, 80.00, 50.00, 'Reduced alcohol spending from $80 to $50'),
(5, 5, 120.00, 80.00, 'Reduced hobby expenses from $120 to $80');

-- Scenario 6: User03 (Charlie) - Alternative Emergency Fund Strategy
INSERT INTO whatifscenario (user_id, goal_id, name, created_at) VALUES
(3, 4, 'Alternative Emergency Fund Strategy', '2025-08-10 13:30:00');

INSERT INTO whatifadjustment (scenario_id, category_id, original_amt, new_amt, note) VALUES
(6, 2, 110.00, 50.00, 'Major dining reduction from $110 to $50'),
(6, 4, 160.00, 80.00, 'Significant entertainment cut from $160 to $80'),
(6, 6, 140.00, 70.00, 'Halved shopping budget from $140 to $70'),
(6, 5, 80.00, 30.00, 'Drastically reduced hobbies from $80 to $30'),
(6, 7, 6.50, 3.00, 'Reduced coffee spending from $6.50 to $3.00'),
(6, 12, 130.00, 90.00, 'Reduced grocery budget from $130 to $90');

