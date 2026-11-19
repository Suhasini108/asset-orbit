-- =========================================================================
-- AssetOrbit: Enterprise IT Asset & Subscription Management System
-- Database Schema (PostgreSQL / Supabase / Neon / MySQL compatible)
-- =========================================================================

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Admin/IT Manager', 'Department Head', 'Employee', 'Auditor')),
    department VARCHAR(100) NOT NULL,
    sub_branch VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories & Sub-Branches
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sub_branches (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE (category_id, name)
);

CREATE TABLE IF NOT EXISTS college_labs (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(50) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 30,
    supervisor_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vendors Directory
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    contact_person VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(50),
    rating NUMERIC(2,1) DEFAULT 4.5,
    active_contracts INT DEFAULT 1,
    sla_terms TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Asset Batches (for Bulk Quantity Asset Generation)
CREATE TABLE IF NOT EXISTS asset_batches (
    id VARCHAR(50) PRIMARY KEY,
    batch_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_branch VARCHAR(100),
    lab_id VARCHAR(36) REFERENCES college_labs(id) ON DELETE SET NULL,
    created_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Core Assets Inventory
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(50) PRIMARY KEY,
    batch_id VARCHAR(50) REFERENCES asset_batches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    sub_branch VARCHAR(100) NOT NULL,
    lab_room VARCHAR(150),
    bench_number VARCHAR(100),
    vendor_id VARCHAR(36) REFERENCES vendors(id) ON DELETE SET NULL,
    purchase_date DATE NOT NULL,
    cost NUMERIC(12,2) NOT NULL,
    salvage_value NUMERIC(12,2) DEFAULT 0,
    useful_life_years INT DEFAULT 5,
    warranty_expiry DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available' 
        CHECK (status IN ('Available', 'Assigned', 'In Repair', 'Lost', 'Stolen', 'Retired', 'E-Waste')),
    assigned_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    assigned_user_label VARCHAR(255),
    health_score INT DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
    qr_code_payload TEXT,
    
    -- Technical Specs (JSONB for flexibility)
    specs JSONB DEFAULT '{
        "cpu": "Intel Core i7",
        "ram": "16GB",
        "storage": "512GB SSD",
        "os": "Ubuntu 22.04 LTS / Win 11",
        "ipAddress": "192.168.1.1",
        "macAddress": "00:00:00:00:00:00"
    }'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Asset Lifecycle Timeline
CREATE TABLE IF NOT EXISTS asset_timeline_events (
    id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    notes TEXT,
    created_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Software Subscriptions & Licenses
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    vendor_id VARCHAR(36) REFERENCES vendors(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'Yearly' CHECK (billing_cycle IN ('Monthly', 'Quarterly', 'Yearly')),
    cost NUMERIC(12,2) NOT NULL,
    previous_cost NUMERIC(12,2),
    total_seats INT NOT NULL,
    assigned_seats INT DEFAULT 0,
    active_users_30d INT DEFAULT 0,
    inactive_users_90d INT DEFAULT 0,
    renewal_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    department VARCHAR(100) NOT NULL,
    owner_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    owner_label VARCHAR(255),
    license_type VARCHAR(150),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Subscription Price History (Price Hike Detection)
CREATE TABLE IF NOT EXISTS subscription_price_history (
    id SERIAL PRIMARY KEY,
    subscription_id VARCHAR(36) REFERENCES subscriptions(id) ON DELETE CASCADE,
    year_recorded VARCHAR(10) NOT NULL,
    cost NUMERIC(12,2) NOT NULL,
    price_increase_percentage NUMERIC(5,2),
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tickets & Issue Resolution
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE SET NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    sla_target_hours INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open' 
        CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Waiting for Parts', 'Resolved', 'Closed')),
    category VARCHAR(100),
    reporter_id VARCHAR(36) REFERENCES users(id),
    reporter_name VARCHAR(150),
    assigned_technician_id VARCHAR(36) REFERENCES users(id),
    assigned_technician_name VARCHAR(150),
    loaner_asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE SET NULL,
    resolution_action VARCHAR(255),
    resolution_summary TEXT,
    parts_cost NUMERIC(10,2) DEFAULT 0,
    labor_cost NUMERIC(10,2) DEFAULT 0,
    satisfaction_rating INT CHECK (satisfaction_rating BETWEEN 1 AND 5),
    photo_url TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ticket_checklist_items (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(36) REFERENCES tickets(id) ON DELETE CASCADE,
    item_text VARCHAR(255) NOT NULL,
    is_done BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ticket_notes (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(36) REFERENCES tickets(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Shadow IT Detection Logs
CREATE TABLE IF NOT EXISTS shadow_it_logs (
    id VARCHAR(36) PRIMARY KEY,
    app_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    detected_on_asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    department VARCHAR(100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('High', 'Medium', 'Low')),
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    threat_reason TEXT,
    data_transfer VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Flagged' CHECK (status IN ('Flagged', 'Approved', 'Quarantined', 'Under Review')),
    remediation_action TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. E-Waste Management & Certificates
CREATE TABLE IF NOT EXISTS e_waste_records (
    id VARCHAR(50) PRIMARY KEY,
    batch_name VARCHAR(255) NOT NULL,
    asset_count INT NOT NULL DEFAULT 1,
    total_weight_kg NUMERIC(8,2) NOT NULL,
    disposal_method VARCHAR(255) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    data_wipe_method VARCHAR(255) NOT NULL,
    data_wipe_completed BOOLEAN DEFAULT TRUE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    co2_offset_kg NUMERIC(10,2),
    toxic_metals_diverted_kg NUMERIC(10,2),
    status VARCHAR(50) DEFAULT 'Certified & Disposed',
    disposal_date DATE NOT NULL,
    officer_in_charge VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Loss and Theft Incident Reports
CREATE TABLE IF NOT EXISTS loss_theft_reports (
    id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE SET NULL,
    asset_name VARCHAR(255) NOT NULL,
    incident_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    circumstances TEXT NOT NULL,
    police_fir_number VARCHAR(100),
    insurance_claim_number VARCHAR(100),
    insurance_status VARCHAR(100),
    evidence_file_url TEXT,
    reporter_name VARCHAR(150),
    status VARCHAR(100) DEFAULT 'Pending HOD Approval',
    hod_approved BOOLEAN DEFAULT FALSE,
    hod_approved_by VARCHAR(150),
    admin_approved BOOLEAN DEFAULT FALSE,
    admin_approved_by VARCHAR(150),
    investigation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. System Activity Audit Logs
CREATE TABLE IF NOT EXISTS system_activity_logs (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_assets_category_subbranch ON assets(category, sub_branch);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_lab ON assets(lab_room);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal ON subscriptions(renewal_date);
