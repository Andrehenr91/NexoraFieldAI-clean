# ============================================================
# NexoraField AI — Terraform Variables (Fase 4)
# ============================================================

variable "project_id" {
  description = "ID do projeto GCP"
  type        = string
  default     = "nexorafield-prod"
}

variable "region" {
  description = "Região primária GCP"
  type        = string
  default     = "southamerica-east1"
}

variable "zone" {
  description = "Zona primária GCP"
  type        = string
  default     = "southamerica-east1-a"
}

variable "environment" {
  description = "Ambiente (production | staging | development)"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment deve ser production, staging ou development."
  }
}

variable "gke_min_nodes" {
  description = "Mínimo de nodes no cluster GKE"
  type        = number
  default     = 2
}

variable "gke_max_nodes" {
  description = "Máximo de nodes no cluster GKE"
  type        = number
  default     = 10
}

variable "db_tier" {
  description = "Tier da instância Cloud SQL"
  type        = string
  default     = "db-custom-2-7680"
}

variable "redis_memory_gb" {
  description = "Memória do Memorystore Redis em GB"
  type        = number
  default     = 4
}
