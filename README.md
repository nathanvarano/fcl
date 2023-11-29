# FCL

![image](https://github.com/nathanvarano/fcl/assets/45152772/67bb8517-9f1c-42f3-ac22-43e6371554e2)


## To note
No idea what "machine numbers" are, will attempt to implement correctly during the week if I've got time.

## Install script

```shell
docker-compose up --build --detach
npx prisma migrate dev --name init
```


## Deployment strategy

### Implement ECR (Elastic Container Registry)
Use Amazon’s ECR service to set up a repository for the docker images. This will be used alongside ECS and ALB to ensure high availability (HA). Firstly, create a repository in ECR via the AWS CLI, with the name ‘fcl-repository’ and region ‘ap-southeast-4’ (this is Melbourne).
```bash
aws ecr create-repository --repository-name fcl-repository --region ap-southeast-4
```
Then tag both docker images with the name of the repository used in the previous step “fcl-repository” along with the repositoryUri output from the ‘create-repository’ command.
```bash
docker tag fcl-repository <aws_account_id>.dkr.ecr.ap-southeast-4.amazonaws.com/fcl-repository
```

Authenticate docker client with ECR
```bash
aws ecr get-login-password –region ap-southeast-4.amazonaws.com/fcl-repository | docker login –username AWS —password-stdin <aws_ccount_id>.dkr.ecr.ap-southeast-4.amazonaws.com
```
And then push the image to the ECR repository.
```bash
docker push <aws_account_id>.dkr.ecr.ap-southeast-4.amazonaws.com/fcl-repository
```
### Implement ECS (Elastic Container Service)
Omitted: Create VPC

Next, setup ECS with fargate for ease of management (EC2 can be used as an alternative if advanced management of containers is required.)

Follow the setup instructions provided here (We can use the AWS CLI, but the setup is much simpler via the GUI for a once-off setup):
https://docs.aws.amazon.com/AmazonECS/latest/userguide/getting-started-fargate.html

Using the following JSON as the task definition:
```JSON
{
    "family": "fcl-fargate", 
    "networkMode": "awsvpc", 
    "containerDefinitions": [
        {
            "name": "fcl-project", 
            "image": "public.ecr.aws/docker/library/httpd", 
            "portMappings": [
                {
                    "containerPort": 80, 
                    "hostPort": 80, 
                    "protocol": "tcp"
                }
            ], 
            "essential": true, 
            "entryPoint": [
                "sh",
		"-c"
            ], 
        }
    ], 
    "requiresCompatibilities": [
        "FARGATE"
    ], 
    "cpu": "256", 
    "memory": "512"
}
```


The task definition omits the ‘command’ field so that the default commands we defined in the docker image (CMD ["npm", "start"]), are used.

‘awsvpc’ is specified as the ‘networkMode’ for higher performance ensuring (HA), as well as greater control over network configuration.

Once finished with the above steps, deploy ECS.

### Implement AZ (Availability Zones)
Next implement Availability Zones so that if a particular zone is down, traffic can be automatically routed to another instance whilst the problematic zone can recover. This will ensure HA by maximising uptime in the event of a failure.

The following steps describe how to implement Availability Zones (Direct from the AWS documentation at: Availability zones)

1. Open the Amazon EC2 console at https://console.aws.amazon.com/ec2/.
2. On the navigation pane, choose Load Balancers.
3. Select the load balancer.
4. On the Network mapping tab, choose Edit subnets.
5. To enable an Availability Zone, select its checkbox and select one subnet. If there is only one available subnet, it is selected for you.
6. To change the subnet for an enabled Availability Zone, choose one of the other subnets from the list.
7. To disable an Availability Zone, clear its checkbox.
8. Choose Save changes.

### Implement ALB (Application Load Balancer)
For the last step of the HA plan, implement ALB. To create a load balancer, provide a name for the load balancer (fcl-alb), as well as the two subnets from the previous step.

```bash
aws elbv2 create-load-balancer --name fcl-alb  --subnets <subnet_1> <subnet_2>
```
Next, create the target groups that will direct traffic to the fargate tasks that were created during the ECS step. the vpc-id is from the VPC created at the start of the ECS preparation. (Both of these steps were omitted for this deployment documentation)
```bash
aws elbv2 create-target-group --name fcl-alb-tg --protocol HTTP --port 80 \
--vpc-id <ecs-vpc> --ip-address-type <ipv4 or ipv6>
```
Then register the required fargate instances with the target group we just created.

```bash
aws elbv2 register-targets --target-group-arn fcl-alb-tg  \
--targets Id=<fargate_instance_id_1> Id=<fargate_instance_id_2>
```
Lastly, create a listener for the load balancer to forward with default actions to the target group created in the previous step.

```bash
aws elbv2 create-listener --load-balancer-arn fcl-alb\
--protocol HTTP --port 80  \
--default-actions Type=forward,TargetGroupArn=fcl-alb-tg
```

Other High Availability (HA) options 
In addition to the above services, logging, monitoring and debugging tools can be used to increase efficiency in terms of solving any problems that may arise to bring instances back online as soon as possible.This includes tools such as Elastic Beanstalk, CloudWatch, etc.


### Implement S3 (Simple Storage Service)
To make sure data is still accessible both during and after disaster, we can implement AWS S3, for storing backups and crucial data, making it a perfect option for DR.

Creating a bucket is simple, and can be done with the AWS CLI as follows:
```bash
aws s3api create-bucket --bucket fcl-bucket --region ap-southeast-4
```
### Implement AG (Amazon Glacier) 
For the sake of storing important historical backups, we can implement Amazon glacier, to ensure that data is kept secure.

To store data with Amazon Glacier, we need to create a vault, which can be done with the AWS CLI, like so:
```bash
aws glacier create-vault --account-id - --vault-name fcl-vault
```
We can then prepare a file for uploading, such as a database backup, to the vault with the “dd” command (Alternatively fsutil for windows), for example:

```bash
dd if=/dev/urandom of=<file_name> bs=3145728 count=1
```
And then split the file into chunks:
```bash
split -b 1048576 --verbose <file_name> chunk
```
Once the file is prepared, the upload can be initiated:
```bash
aws glacier initiate-multipart-upload --account-id - --archive-description <archive-desc> --part-size 1048576 --vault-name fcl-vault
```
And then commenced with:
```bash
aws glacier upload-multipart-part --upload-id <upload-id-from-previous-step> body <chunk-from-split-step> --range 'bytes 0-1048575/*' --account-id - --vault-name <fcl-vault>
```
Finally, confirm the upload by comparing the local hash matches the vault hash:
```bash
aws glacier complete-multipart-upload --checksum <tree_hash> --archive-size 3145728 --upload-id <upload_id>  --account-id - --vault-name fcl-vault
```

Other Disaster Recovery (DR) options 
Amazon recently announced a new service called ‘DRS’, which is specifically aimed towards disaster recovery (hence “Elastic Disaster Recovery Service”).


