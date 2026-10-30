-- Indexes for tenant-scoped foreign keys. Keep low-volume unused-index alert
-- under observation until real usage; do not prematurely remove useful status index.
create index if not exists fieldforce_invitations_accepted_by_idx on fieldforce.invitations(accepted_by) where accepted_by is not null;
create index if not exists fieldforce_invitations_issued_by_idx on fieldforce.invitations(issued_by);
create index if not exists fieldforce_events_actor_idx on fieldforce.work_order_events(organization_id,actor_id) where actor_id is not null;
create index if not exists fieldforce_orders_customer_fk_idx on fieldforce.work_orders(organization_id,customer_id);
