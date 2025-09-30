# Network module for C12USD - VPC, subnets, security groups, and connectivity

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Create VPC network
resource "google_compute_network" "main" {
  name                    = var.vpc_name
  auto_create_subnetworks = false
  routing_mode           = "REGIONAL"
  description            = "Main VPC network for ${var.vpc_name}"

}

# Create private subnet for application tier
resource "google_compute_subnetwork" "private" {
  name          = "${var.subnet_name}-private"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.main.id
  description   = "Private subnet for application workloads"

  # Enable private Google access
  private_ip_google_access = true

  # Enable flow logs for security monitoring
  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }

  # Secondary IP ranges for services
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.2.0.0/16"
  }
}

# Create public subnet for load balancers
resource "google_compute_subnetwork" "public" {
  name          = "${var.subnet_name}-public"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.main.id
  description   = "Public subnet for load balancers and external access"

  # Enable flow logs
  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Create database subnet for Cloud SQL
resource "google_compute_subnetwork" "database" {
  name          = "${var.subnet_name}-database"
  ip_cidr_range = "10.0.3.0/24"
  region        = var.region
  network       = google_compute_network.main.id
  description   = "Database subnet for Cloud SQL and data services"

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Cloud Router for NAT
resource "google_compute_router" "main" {
  name    = "${var.vpc_name}-router"
  region  = var.region
  network = google_compute_network.main.id

  bgp {
    asn = 64514
  }
}

# Cloud NAT for outbound internet access from private subnets
resource "google_compute_router_nat" "main" {
  name                               = "${var.vpc_name}-nat"
  router                             = google_compute_router.main.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Private Service Connection for Cloud SQL
resource "google_compute_global_address" "private_ip_range" {
  name          = "${var.vpc_name}-private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

# VPC Connector for serverless access to VPC
resource "google_vpc_access_connector" "main" {
  name          = "${var.vpc_name}-connector"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.main.name

  max_throughput = 300
  min_throughput = 200

  depends_on = [google_compute_subnetwork.private]
}

# Firewall rules
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.vpc_name}-allow-internal"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16"
  ]

  description = "Allow all internal traffic within VPC"
}

resource "google_compute_firewall" "allow_ssh_iap" {
  name    = "${var.vpc_name}-allow-ssh-iap"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["ssh-access"]

  description = "Allow SSH access via Identity-Aware Proxy"
}

resource "google_compute_firewall" "allow_health_checks" {
  name    = "${var.vpc_name}-allow-health-checks"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080"]
  }

  source_ranges = [
    "35.191.0.0/16",
    "130.211.0.0/22"
  ]

  target_tags = ["allow-health-checks"]

  description = "Allow Google Cloud health checks"
}

resource "google_compute_firewall" "allow_cloud_sql" {
  name    = "${var.vpc_name}-allow-cloud-sql"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["5432", "3306"]
  }

  source_ranges = [
    google_compute_subnetwork.private.ip_cidr_range,
    google_vpc_access_connector.main.ip_cidr_range
  ]

  target_tags = ["cloud-sql"]

  description = "Allow database connections from application subnets"
}

# Firewall rule for web traffic
resource "google_compute_firewall" "allow_web" {
  name    = "${var.vpc_name}-allow-web"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web-server"]

  description = "Allow HTTP and HTTPS traffic from internet"
}

# Deny all other traffic by default (implicit)
resource "google_compute_firewall" "deny_all" {
  name     = "${var.vpc_name}-deny-all"
  network  = google_compute_network.main.name
  priority = 65534

  deny {
    protocol = "all"
  }

  source_ranges = ["0.0.0.0/0"]

  description = "Deny all traffic by default"
}

# Security policy for DDoS protection
resource "google_compute_security_policy" "main" {
  name        = "${var.vpc_name}-security-policy"
  description = "Security policy for C12USD application"

  # Default rule - allow all
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "default rule"
  }

  # Rate limiting rule
  rule {
    action   = "throttle"
    priority = "1000"
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
    description = "Rate limit rule - 100 requests per minute per IP"
  }

  # Block known bad IPs
  rule {
    action   = "deny(403)"
    priority = "500"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = [
          "192.168.100.0/24",  # Example bad IP range
        ]
      }
    }
    description = "Block known malicious IPs"
  }
}

# Cloud Armor edge security policy
resource "google_compute_security_policy" "edge_security" {
  name        = "${var.vpc_name}-edge-security"
  description = "Edge security policy with advanced DDoS protection"
  type        = "CLOUD_ARMOR"

  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable = true
    }
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
    description = "Default allow rule"
  }

  # Geo-blocking rule (example)
  rule {
    action   = "deny(403)"
    priority = "1001"
    match {
      expr {
        expression = "origin.region_code == 'CN' || origin.region_code == 'RU'"
      }
    }
    description = "Block traffic from specific regions"
  }
}

# Output values
output "vpc_network_id" {
  description = "The ID of the VPC network"
  value       = google_compute_network.main.id
}

output "vpc_network_name" {
  description = "The name of the VPC network"
  value       = google_compute_network.main.name
}

output "private_subnet_id" {
  description = "The ID of the private subnet"
  value       = google_compute_subnetwork.private.id
}

output "public_subnet_id" {
  description = "The ID of the public subnet"
  value       = google_compute_subnetwork.public.id
}

output "database_subnet_id" {
  description = "The ID of the database subnet"
  value       = google_compute_subnetwork.database.id
}

output "vpc_connector_id" {
  description = "The ID of the VPC connector"
  value       = google_vpc_access_connector.main.id
}

output "vpc_connector_name" {
  description = "The name of the VPC connector"
  value       = google_vpc_access_connector.main.name
}

output "private_vpc_connection_id" {
  description = "The ID of the private VPC connection"
  value       = google_service_networking_connection.private_vpc_connection.id
}

output "security_policy_id" {
  description = "The ID of the security policy"
  value       = google_compute_security_policy.main.id
}

output "edge_security_policy_id" {
  description = "The ID of the edge security policy"
  value       = google_compute_security_policy.edge_security.id
}