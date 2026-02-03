-- Drop the database if it exists
DROP DATABASE IF EXISTS expense_tracker;

-- Create a new database
CREATE DATABASE expense_tracker;

-- Use the new database
USE expense_tracker;
SET FOREIGN_KEY_CHECKS = 0;
-- Drop view if it exists (to safely rerun this script)
DROP VIEW IF EXISTS all_whatif_adjustments;
-- Drop tables if they exist (to safely rerun this script)
DROP TABLE IF EXISTS 
    whatif_categories,
    whatifadjustment,
    whatifscenario,
    savings,
    expenses,
    fixedexpenses,
    goals,
    categories,
    income,
    user_tip_interactions,
    tips,
    user;
SET FOREIGN_KEY_CHECKS = 1;
-- Create User table
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE income (
    income_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency ENUM('yearly', 'monthly', 'weekly', 'hourly') DEFAULT 'monthly',
    comment VARCHAR (255),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE
);

CREATE TABLE fixedexpenses (
    fixed_expense_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,              -- e.g., "Rent", "Power", "Insurance"
    amount DECIMAL(10,2) NOT NULL,           -- monthly cost
    biling_cycle ENUM('monthly', 'weekly', 'yearly') DEFAULT 'monthly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE
);


CREATE table categories (
    category_id INT AUTO_INCREMENT PRIMARY Key,
    cat_name VARCHAR(100) NOT NULL,
    can_suggest_reduction BOOLEAN DEFAULT TRUE

);
-- Create Goals table
CREATE TABLE goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,             
    target_date DATE NOT NULL,                        
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE
);

-- Create Savings table
CREATE TABLE savings (
    savings_id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,            -- amount saved in this contribution
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date DATE NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals(goal_id)
        ON DELETE CASCADE
);

CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category_id INT NOT NULL,
    date Date NOT NUll,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE CASCADE
);

-- WhatIfScenario store scenarios created

CREATE Table whatifscenario (
    scenario_id INT AUTO_INCREMENT PRIMARY KEY, 
    user_id INT NOT NULL,
    goal_id INT, -- if user chooses to apply scenario to specific goal
    name VARCHAR(100) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(goal_id)
        on DELETE CASCADE
    );

-- WhatIfAdjustment to record user adjustment 


CREATE TABLE whatifadjustment (
    adjustment_id INT AUTO_INCREMENT PRIMARY Key, 
    scenario_id INT NOT NULL, 
    category_id INT NOT NULL,
    is_hypothetical_cat BOOLEAN DEFAULT FALSE,
    original_amt DECIMAL (10,2) NOT NULL, 
    new_amt DECIMAL (10,2) NOT nULL, 
    note Text, 
    
    FOREIGN KEY (scenario_id) REFERENCES whatifscenario(scenario_id)
        ON DELETE CASCADE
);

-- might use this to display "most impactful change"
-- CREATE TABLE whatifprojection (
--     projection_id INT AUTO_INCREMENT PRIMARY KEY,
--     scenario_id INT NOT NULL,
--     projected_savings DECIMAL(10,2) NOT NULL,    -- total extra saved
--     projected_completion_date DATE,              -- new earlier date to reach goal
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (scenario_id) REFERENCES whatifscenario(scenario_id)
--         ON DELETE CASCADE
-- );

-- create table for personalised tips
-- store tips
CREATE TABLE tips (
    tip_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    tip_type ENUM('income_expense', 'savings_progress', 'category_analysis', 'weekend_spending', 'behavioral', 'large_one_time_expense', 'general_tip') NOT NULL,
    priority ENUM ('urgent', 'warning', 'suggestion', 'congratulation') NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    message text NOT NULL, 
    actionable_advice TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) on DELETE CASCADE
);

CREATE TABLE user_tip_interactions (
    interaction_id INT AUTO_INCREMENT PRIMARY KEY,
    tip_id INT NOT NULL,
    user_id INT NOT NULL,
    action ENUM('read', 'dismissed') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tip_id) REFERENCES tips(tip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- (NOT IN USE )Track daily tip generation to prevent multiple generations per day
-- CREATE TABLE daily_tips_generated (
--     user_id INT,
--     generation_date DATE,
--     PRIMARY KEY (user_id, generation_date),
--     FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
-- );

-- hypothetical What-if categories which user can create
-- Create new table for hypothetical categories
CREATE TABLE whatif_categories (
    hypothetical_category_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Union view to easily query both real and hypothetical adjustments
CREATE VIEW all_whatif_adjustments AS
-- Real category adjustments
SELECT 
    wia.adjustment_id,
    wia.scenario_id,
    wia.category_id,
    wia.original_amt,
    wia.new_amt,
    wia.note,
    FALSE as is_hypothetical,
    c.cat_name as category_name,
    (wia.original_amt - wia.new_amt) as saving_amt
FROM whatifadjustment wia
JOIN categories c ON wia.category_id = c.category_id
WHERE wia.is_hypothetical_cat = FALSE

UNION ALL

-- Hypothetical category adjustments (with LEFT JOIN to handle deleted categories)
SELECT 
    wia.adjustment_id,
    wia.scenario_id,
    wia.category_id,
    wia.original_amt,
    wia.new_amt,
    wia.note,
    TRUE as is_hypothetical,
    wc.category_name,
    (wia.original_amt - wia.new_amt) as saving_amt
FROM whatifadjustment wia
LEFT JOIN whatif_categories wc ON wia.category_id = wc.hypothetical_category_id
WHERE wia.is_hypothetical_cat = TRUE;

