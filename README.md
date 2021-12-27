# scheduler
Scheduler allow you to don't think about how to queue pending calls and how to schedule multiple tasks at the same time. The scheduler doing everything for you, just add scheduled tasks to it and it will do everything in queue order.

To schedule a task, call the "schedule" method, pass there 1. Date, 2. callback function. It Returns uniq Id for remove if task was scheduled.
With that id you could to cancel task, just pass id to cancelSchedule method.

To set maximum allowable delay: 1. Pass value when creating new instance. 2. Call setMaxDelay method with value for Scheduler. This value is in ms.
