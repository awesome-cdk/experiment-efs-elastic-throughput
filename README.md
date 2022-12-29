An experimental CDK app that creates two EFS file systems, one with "elastic" throughput mode and the other
with "burstable" throughput mode.

Also creates two Lambdas that benchmark the write IO performance to these two file systems,
writing files of different
sizes.
