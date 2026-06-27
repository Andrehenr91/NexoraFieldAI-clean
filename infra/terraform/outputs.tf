# ============================================================
# NexoraField AI — Terraform Outputs (Fase 4)
# ============================================================

output "gke_cluster_name" {
  description = "Nome do cluster GKE"
  value       = google_container_cluster.nexora_cluster.name
}

output "gke_cluster_endpoint" {
  description = "Endpoint do cluster GKE"
  value       = google_container_cluster.nexora_cluster.endpoint
  sensitive   = true
}

output "postgres_connection_name" {
  description = "Connection name do Cloud SQL"
  value       = google_sql_database_instance.nexora_postgres.connection_name
}

output "postgres_private_ip" {
  description = "IP privado do Cloud SQL"
  value       = google_sql_database_instance.nexora_postgres.private_ip_address
  sensitive   = true
}

output "redis_host" {
  description = "Host do Memorystore Redis"
  value       = google_redis_instance.nexora_redis.host
  sensitive   = true
}

output "uploads_bucket_name" {
  description = "Nome do bucket de uploads"
  value       = google_storage_bucket.nexora_uploads.name
}

output "backups_bucket_name" {
  description = "Nome do bucket de backups"
  value       = google_storage_bucket.nexora_backups.name
}

output "artifact_registry_url" {
  description = "URL do Artifact Registry"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/nexorafield"
}

output "vpc_name" {
  description = "Nome da VPC"
  value       = google_compute_network.nexora_vpc.name
}
