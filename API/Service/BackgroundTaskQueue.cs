using System.Threading.Channels;

namespace API.Service;

public class BackgroundTaskQueue {
    private readonly Channel<Func<IServiceProvider, CancellationToken, Task>> contentDetailsQueue =
        Channel.CreateUnbounded<Func<IServiceProvider, CancellationToken, Task>>();
    private readonly Channel<Func<IServiceProvider, CancellationToken, Task>> posterRefreshQueue =
        Channel.CreateBounded<Func<IServiceProvider, CancellationToken, Task>>(100);

    public void QueueContentDetailsWorkItem(Func<IServiceProvider, CancellationToken, Task> workItem) =>
        contentDetailsQueue.Writer.TryWrite(workItem);

    public bool QueuePosterRefreshWorkItem(Func<IServiceProvider, CancellationToken, Task> workItem) =>
        posterRefreshQueue.Writer.TryWrite(workItem);

    public bool TryDequeueContentDetails(out Func<IServiceProvider, CancellationToken, Task>? workItem) =>
        contentDetailsQueue.Reader.TryRead(out workItem);

    public bool TryDequeuePosterRefresh(out Func<IServiceProvider, CancellationToken, Task>? workItem) =>
        posterRefreshQueue.Reader.TryRead(out workItem);

    public async Task WaitForWorkAsync(CancellationToken cancellationToken) {
        Task<bool> contentDetailsReady = contentDetailsQueue.Reader.WaitToReadAsync(cancellationToken).AsTask();
        Task<bool> posterRefreshReady = posterRefreshQueue.Reader.WaitToReadAsync(cancellationToken).AsTask();
        await Task.WhenAny(contentDetailsReady, posterRefreshReady);
    }
}
