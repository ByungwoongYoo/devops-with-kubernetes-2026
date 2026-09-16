# Exercise 3.9 — DBaaS vs DIY PostgreSQL on GKE

This comparison focuses on the practical differences between running PostgreSQL ourselves in GKE with a StatefulSet + PersistentVolumeClaim and using a managed DBaaS such as Google Cloud SQL for PostgreSQL.

| Topic | DBaaS (Cloud SQL) | DIY PostgreSQL in GKE |
| --- | --- | --- |
| Initial setup work | Create the managed database instance, database/user credentials, networking/private IP or authorized access, and application connection settings. Google manages the database host and storage layer. | Create and maintain the StatefulSet, Service, Secret, storage claim, database initialization, readiness checks, upgrade strategy, and connectivity ourselves. |
| Initial cost | Usually higher than a very small self-hosted database because the managed instance has its own compute/storage charges and optional HA/backups. | Can be cheaper for a small course/dev workload because the database shares the existing GKE cluster; the main extra cost is persistent disk/storage. |
| Ongoing cost | Separate managed database compute + storage + backup/network-related charges. HA/read replicas increase cost further. | Uses GKE node capacity plus persistent disks. If the cluster already exists and has spare resources, marginal cost can be low, but larger DB workloads may force larger/more nodes. |
| Maintenance | Patching, database host management, storage infrastructure, many operational tasks, and managed backup features are handled by the provider. | We are responsible for PostgreSQL version upgrades, image changes, resource sizing, failed-pod recovery behavior, storage configuration, monitoring, security hardening, and testing restore procedures. |
| Availability | Managed HA/failover options are available and do not depend on us designing a multi-node PostgreSQL setup inside Kubernetes. | A single StatefulSet replica is simple but is not highly available. Real HA requires additional replication/failover tooling and significantly more operational work. |
| Backups | Managed automated backups and point-in-time recovery can be enabled. Restores are provider-supported workflows and are relatively easy to operate. | We must build the backup process ourselves (for example `pg_dump` from a CronJob), choose durable external storage, manage credentials/permissions, retention, monitoring, and regularly test restores. |
| Backup failure risk | The provider operates the backup infrastructure, although we still need to configure retention and verify restores. | A CronJob can silently fail, storage credentials can expire/change, or the backup can remain inside the same failure domain unless we explicitly upload it elsewhere. We own detection and recovery. |
| Scaling | Instance size/storage can be changed through the managed service; read replicas and other managed features may be available. | We must size pod requests/limits, disks, nodes, and PostgreSQL itself. Kubernetes pod scaling does not automatically make a single PostgreSQL database horizontally scalable. |
| Portability | More dependence on the cloud provider's managed service, networking, IAM and operational features. | PostgreSQL itself remains close to a standard containerized deployment and is easier to move between Kubernetes environments, although storage/network details still differ. |
| Operational control | Less low-level control because the provider manages the database host. | Maximum control over image/version/configuration and surrounding Kubernetes resources. |

## Choice for this project

For this course project, keeping PostgreSQL in GKE is useful because it demonstrates StatefulSets, PVCs, Secrets, Jobs/CronJobs and backup plumbing directly. For a production service where database reliability matters more than learning those Kubernetes internals, a managed PostgreSQL service would often reduce operational risk and maintenance effort, at the cost of a separate managed-service bill and stronger cloud-provider coupling.

The key trade-off is therefore not simply "managed is expensive / self-hosted is cheap". DBaaS buys reduced operational burden, easier managed backups/restores and optional HA. DIY can minimize marginal cost and maximize control, but the team becomes responsible for database operations and recovery.
