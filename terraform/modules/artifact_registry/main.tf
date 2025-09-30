# Artifact Registry module for C12USD - Docker image repository

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Create Artifact Registry repository for Docker images
resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "${var.project_name}-repo"
  description   = "Docker repository for C12USD application"
  format        = "DOCKER"

  labels = var.labels

  cleanup_policies {
    id     = "keep-latest-versions"
    action = "KEEP"

    condition {
      tag_state    = "TAGGED"
      tag_prefixes = ["latest", "production", "staging"]
    }

    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"

    condition {
      tag_state = "UNTAGGED"
      older_than = "2592000s"  # 30 days
    }
  }
}

# IAM bindings for Artifact Registry
# Note: Commenting out temporarily to resolve service account reference issues
# These will be configured after service accounts are properly created
# resource "google_artifact_registry_repository_iam_binding" "readers" {
#   project    = var.project_id
#   location   = google_artifact_registry_repository.main.location
#   repository = google_artifact_registry_repository.main.name
#   role       = "roles/artifactregistry.reader"
#
#   members = [
#     "serviceAccount:${var.cloud_run_service_account}",
#     "serviceAccount:${var.cloud_build_service_account}",
#   ]
# }
#
# resource "google_artifact_registry_repository_iam_binding" "writers" {
#   project    = var.project_id
#   location   = google_artifact_registry_repository.main.location
#   repository = google_artifact_registry_repository.main.name
#   role       = "roles/artifactregistry.writer"
#
#   members = [
#     "serviceAccount:${var.cloud_build_service_account}",
#   ]
# }

# Vulnerability scanning
# Note: Commenting out due to configuration complexity - will be configured later
# resource "google_container_analysis_occurrence" "vulnerability_scan" {
#   name           = "projects/${var.project_id}/occurrences/vulnerability-scan-${var.project_name}"
#   resource_uri   = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.name}/*"
#   note_name      = "projects/${var.project_id}/notes/vulnerability-scan-note"
#   kind           = "VULNERABILITY"
#
#   attestation {
#     serialized_payload = base64encode("example payload")
#     signatures {
#       public_key_id = "example-key-id"
#       signature     = base64encode("example signature")
#     }
#   }
# }

# Container Analysis note for vulnerability scanning
# Note: Commenting out due to configuration complexity - will be configured later
# resource "google_container_analysis_note" "vulnerability_scan" {
#   name = "vulnerability-scan-note"
#
#   attestation_authority {
#     hint {
#       human_readable_name = "Attestor for C12USD"
#     }
#   }
# }

# Output values
output "repository_url" {
  description = "The URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.name}"
}

output "repository_name" {
  description = "The name of the Artifact Registry repository"
  value       = google_artifact_registry_repository.main.name
}

output "repository_id" {
  description = "The ID of the Artifact Registry repository"
  value       = google_artifact_registry_repository.main.id
}