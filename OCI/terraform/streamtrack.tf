provider "oci" {}

variable "ssh_authorized_keys" {
  description = "List of SSH public keys"
  type = list(string)
}

variable "hashed_password" {
  description = "Hashed password for cloud-init"
  type        = string
}

variable "availability_domain" {
  description = "OCI availability domain for the StreamTrack instance"
  type        = string
}

variable "compartment_id" {
  description = "OCID of the compartment (tenancy) to deploy into"
  type        = string
}

variable "subnet_id" {
  description = "OCID of the subnet for the instance VNIC"
  type        = string
}

variable "image_source_id" {
  description = "OCID of the boot image"
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
	availability_domain = var.availability_domain
	compartment_id = var.compartment_id
	create_vnic_details {
		assign_ipv6ip = "false"
		assign_private_dns_record = "true"
		assign_public_ip = "true"
		display_name = "StreamTrack"
		subnet_id = var.subnet_id
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
		source_id = var.image_source_id
		source_type = "image"
	}
}
