# Simplified Cloud SQL configuration
resource "google_sql_database_instance" "simple" {
  name             = "c12usd-prod-db"
  database_version = "POSTGRES_16"
  region           = "us-central1"

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "simple_db" {
  name     = "c12usd"
  instance = google_sql_database_instance.simple.name
}

resource "google_sql_user" "simple_user" {
  name     = "c12usd_app"
  instance = google_sql_database_instance.simple.name
  password = random_password.database_password.result
}