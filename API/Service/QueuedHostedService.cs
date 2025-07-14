using API.Helpers;

namespace API.Service;

public class QueuedHostedService : BackgroundService {
    private readonly BackgroundTaskQueue taskQueue;
    private readonly IServiceProvider serviceProvider;

    public QueuedHostedService(BackgroundTaskQueue _taskQueue, IServiceProvider _serviceProvider) {
        this.taskQueue = _taskQueue;
        this.serviceProvider = _serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        while (!stoppingToken.IsCancellationRequested) {
            var workItem = await taskQueue.DequeueAsync(stoppingToken);
            try {
                using var scope = serviceProvider.CreateScope();
                await workItem(scope.ServiceProvider, stoppingToken);
            }
            catch (Exception ex) {
                // Log error
                ConsoleLogger.Error("Error executing async background task: " + ex);
            }
        }
    }
}
