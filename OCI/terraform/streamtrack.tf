provider "oci" {}

variable "ssh_authorized_keys" {
  description = "List of SSH public keys"
  type = list(string)
}

variable "hashed_password" {
  description = "Hashed password for cloud-init"
  type        = string
}

resource "oci_core_instance" "generated_oci_core_instance" {
	agent_config {
		is_management_disabled = "false"
		is_monitoring_disabled = "false"
		plugins_config {
			desired_state = "DISABLED"
			name = "Vulnerability Scanning"
		}
		plugins_config {
			desired_state = "DISABLED"
			name = "Management Agent"
		}
		plugins_config {
			desired_state = "ENABLED"
			name = "Custom Logs Monitoring"
		}
		plugins_config {
			desired_state = "DISABLED"
			name = "Compute RDMA GPU Monitoring"
		}
		plugins_config {
			desired_state = "ENABLED"
			name = "Compute Instance Monitoring"
		}
		plugins_config {
			desired_state = "DISABLED"
			name = "Compute HPC RDMA Auto-Configuration"
		}
		plugins_config {
			desired_state = "DISABLED"
			name = "Compute HPC RDMA Authentication"
		}
		plugins_config {
			desired_state = "ENABLED"
			name = "Cloud Guard Workload Protection"
		}
		plugins_config {
			desired_state = "DISABLED"
			name = "Block Volume Management"
		}
		plugins_config {
			desired_state = "DISABLED"
			name = "Bastion"
		}
	}
	availability_config {
		recovery_action = "RESTORE_INSTANCE"
	}
	availability_domain = "xJLJ:US-SANJOSE-1-AD-1"
	compartment_id = "ocid1.tenancy.oc1..aaaaaaaaaabdayb5d5pi37wn3zd6euzsrcp3fozj2r4jit7xx4bsgpctlhsq"
	create_vnic_details {
		assign_ipv6ip = "false"
		assign_private_dns_record = "true"
		assign_public_ip = "true"
		display_name = "StreamTrack"
		subnet_id = "ocid1.subnet.oc1.us-sanjose-1.aaaaaaaa33iu4rbejd56tdtgyp77psnibgeswun2rd4hjul3mcewhp7a6s2q"
	}
	display_name = "StreamTrack"
	instance_options {
		are_legacy_imds_endpoints_disabled = "false"
	}
	is_pv_encryption_in_transit_enabled = "true"
	metadata = {
		"ssh_authorized_keys" = join("\n", var.ssh_authorized_keys)
		user_data = base64encode(templatefile("${path.module}/cloud-init.yaml", {
			hashed_password = var.hashed_password
		}))
	}
	shape = "VM.Standard.A1.Flex"
	shape_config {
		memory_in_gbs = "3"
		ocpus = "1"
	}
	source_details {
		boot_volume_size_in_gbs = "50"
		boot_volume_vpus_per_gb = "10"
		source_id = "ocid1.image.oc1.us-sanjose-1.aaaaaaaagg6cb3x6qxcoerzncv7zyrhpnwnijp7wuuot6uxrsiiwvzfhaqfq"
		source_type = "image"
	}
}
