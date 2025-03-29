# middleware/performance.py
class PerformanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time
        
        # Log to Prometheus
        metrics.REQUEST_DURATION.labels(
            request.path, request.method
        ).observe(duration)
        
        return response