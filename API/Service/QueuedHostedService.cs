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
            // Try to grab a Content Details fetch request, if none, try to grab a Poster Refresh request
            if (
                !taskQueue.TryDequeueContentDetails(out var workItem) &&
                !taskQueue.TryDequeuePosterRefresh(out workItem)
            ) {
                try {
                    // if there are no request, wait
                    await taskQueue.WaitForWorkAsync(stoppingToken);
                }
                catch (OperationCanceledException) {
                    break;
                }
                continue;
            }

            try {
                // Execute request
                using var scope = serviceProvider.CreateScope();
                await workItem!(scope.ServiceProvider, stoppingToken);
            }
            catch (Exception ex) {
                ConsoleLogger.Error("Error executing async background task: " + ex);
            }
        }
    }
}
