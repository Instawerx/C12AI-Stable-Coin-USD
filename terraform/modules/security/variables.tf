# Variables for security module

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

variable "organization_id" {
  description = "Organization ID for Security Command Center"
  type        = string
  default     = null
}

variable "enable_org_policies" {
  description = "Enable organization policies"
  type        = bool
  default     = false
}