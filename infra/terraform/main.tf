# ============================================================
# NexoraField AI — Terraform GCP Infrastructure (Fase 4)
# Google Cloud Platform — IaC (Infrastructure as Code)
# ============================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "nexorafield-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ─── VPC & Networking ────────────────────────────────────────
resource "google_compute_network" "nexora_vpc" {
  name                    = "nexorafield-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460
}

resource "google_compute_subnetwork" "nexora_subnet_private" {
  name                     = "nexorafield-subnet-private"
  ip_cidr_range            = "10.0.0.0/20"
  region                   = var.region
  network                  = google_compute_network.nexora_vpc.id
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/20"
  }
}

resource "google_compute_router" "nexora_router" {
  name    = "nexorafield-router"
  region  = var.region
  network = google_compute_network.nexora_vpc.id
}

resource "google_compute_router_nat" "nexora_nat" {
  name                               = "nexorafield-nat"
  router                             = google_compute_router.nexora_router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# ─── GKE Cluster ─────────────────────────────────────────────
resource "google_container_cluster" "nexora_cluster" {
  provider = google-beta
  name     = "nexora-cluster-prod"
  location = var.zone

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.nexora_vpc.name
  subnetwork = google_compute_subnetwork.nexora_subnet_private.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All (restrict in prod)"
    }
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  addons_config {
    horizontal_pod_autoscaling {
      disabled = false
    }
    http_load_balancing {
      disabled = false
    }
    gce_persistent_disk_csi_driver_config {
      enabled = true
    }
  }

  release_channel {
    channel = "STABLE"
  }

  maintenance_policy {
    recurring_window {
      start_time = "2024-01-01T03:00:00Z"
      end_time   = "2024-01-01T07:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SU"
    }
  }
}

resource "google_container_node_pool" "nexora_nodes" {
  name     = "nexora-node-pool"
  location = var.zone
  cluster  = google_container_cluster.nexora_cluster.name

  initial_node_count = 2

  autoscaling {
    min_node_count = 2
    max_node_count = 10
  }

  node_config {
    preemptible  = false
    machine_type = "e2-standard-2"
    disk_size_gb = 50
    disk_type    = "pd-ssd"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot = true
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  upgrade_settings {
    max_surge       = 1
    max_unavailable = 0
  }
}

# ─── Cloud SQL PostgreSQL HA ──────────────────────────────────
resource "google_sql_database_instance" "nexora_postgres" {
  name             = "nexorafield-postgres-prod"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-custom-2-7680"
    availability_type = "REGIONAL"  # HA
    disk_autoresize   = true
    disk_size         = 50
    disk_type         = "PD_SSD"

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.nexora_vpc.id
      require_ssl     = true
    }

    database_flags {
      name  = "max_connections"
      value = "200"
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"  # log queries > 1s
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = false
    }

    maintenance_window {
      day  = 7
      hour = 3
    }
  }

  deletion_protection = true
}

resource "google_sql_database" "nexorafield_db" {
  name     = "nexorafield"
  instance = google_sql_database_instance.nexora_postgres.name
}

# Read Replica
resource "google_sql_database_instance" "nexora_postgres_replica" {
  name                 = "nexorafield-postgres-replica"
  master_instance_name = google_sql_database_instance.nexora_postgres.name
  region               = var.region
  database_version     = "POSTGRES_15"

  settings {
    tier              = "db-custom-1-3840"
    availability_type = "ZONAL"
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.nexora_vpc.id
    }
  }
}

# ─── Memorystore Redis ────────────────────────────────────────
resource "google_redis_instance" "nexora_redis" {
  name               = "nexorafield-redis"
  tier               = "STANDARD_HA"
  memory_size_gb     = 4
  region             = var.region
  redis_version      = "REDIS_7_0"
  authorized_network = google_compute_network.nexora_vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  auth_enabled       = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 3
        minutes = 0
      }
    }
  }
}

# ─── Cloud Storage ────────────────────────────────────────────
resource "google_storage_bucket" "nexora_uploads" {
  name          = "nexorafield-uploads-${var.project_id}"
  location      = var.region
  storage_class = "STANDARD"
  force_destroy = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
    condition {
      age = 90
    }
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365
    }
  }

  uniform_bucket_level_access = true

  cors {
    origin          = ["https://app.nexorafield.com.br"]
    method          = ["GET", "POST", "PUT"]
    response_header = ["Content-Type", "Authorization"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "nexora_backups" {
  name          = "nexorafield-backups-${var.project_id}"
  location      = "US"  # multi-region para DR
  storage_class = "COLDLINE"
  force_destroy = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 730  # 2 anos
    }
  }

  uniform_bucket_level_access = true
}

# ─── Artifact Registry ────────────────────────────────────────
resource "google_artifact_registry_repository" "nexora_registry" {
  location      = var.region
  repository_id = "nexorafield"
  description   = "NexoraField Docker images"
  format        = "DOCKER"

  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }
}

# ─── Cloud Armor (WAF) ───────────────────────────────────────
resource "google_compute_security_policy" "nexora_waf" {
  name = "nexorafield-waf"

  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "Block SQL Injection"
  }

  rule {
    action   = "deny(403)"
    priority = "1001"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block XSS"
  }

  rule {
    action   = "throttle"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
    }
    description = "Rate limiting global"
  }

  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow"
  }
}

# ─── Secret Manager ──────────────────────────────────────────
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "gemini-api-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  replication {
    auto {}
  }
}

# ─── Cloud CDN ───────────────────────────────────────────────
resource "google_compute_backend_bucket" "nexora_cdn" {
  name        = "nexorafield-cdn-backend"
  bucket_name = google_storage_bucket.nexora_uploads.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    default_ttl       = 3600
    max_ttl           = 86400
    client_ttl        = 3600
    serve_while_stale = 86400
  }
}
