# OCI

See the API Readme [API/README.md](../API/README.md)

# Terraform (Stacks)

[https://cloud.oracle.com/resourcemanager/stacks?region=us-sanjose-1](https://cloud.oracle.com/resourcemanager/stacks?region=us-sanjose-1)

Create a Stack

Zip up the terraform folder

Upload that zip

Then every time you 'Apply', it makes a new instance with your keys setup already!

See [terraform.tfvars.example](./terraform/terraform.tfvars.example) for an example of `terraform.tfvars`. 
* File name must match **exactly**

**NOTE**
Oracle's UI sucks and you can't actually update the variables there. You have to zip the terraform folder and upload it again as a new version.
