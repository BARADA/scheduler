# scheduler
Scheduler allow you to don't think about how to queue pending calls and how to schedule multiple tasks at the same time. The scheduler doing everything for you, just add scheduled tasks to it and it will do everything in queue order.

To schedule a task, call the "schedule" method, pass there 1. Date, 2. callback function.
To set maximum delay: 1. Pass value when creating new instance. 2. Pass value to setMaxDelay method of Scheduler.
