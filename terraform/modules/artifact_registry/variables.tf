# Variables for artifact registry module

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "cloud_run_service_account" {
  description = "Cloud Run service account email"
  type        = string
  default     = ""
}

variable "cloud_build_service_account" {
  description = "Cloud Build service account email"
  type        = string
  default     = ""
}