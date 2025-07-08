using System.Threading.Channels;

namespace API.Service;

public class BackgroundTaskQueue {
    private readonly Channel<Func<IServiceProvider, CancellationToken, Task>> queue = Channel.CreateUnbounded<Func<IServiceProvider, CancellationToken, Task>>();

    public void QueueBackgroundWorkItem(Func<IServiceProvider, CancellationToken, Task> workItem) =>
        queue.Writer.TryWrite(workItem);

    public async Task<Func<IServiceProvider, CancellationToken, Task>> DequeueAsync(CancellationToken cancellationToken) =>
        await queue.Reader.ReadAsync(cancellationToken);
}
