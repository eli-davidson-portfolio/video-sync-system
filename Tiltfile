# Backend
docker_build('video-sync-backend', './services/video-sync-backend',
    live_update=[
        sync('./services/video-sync-backend', '/app'),
        run('go build -o main .', trigger=['./services/video-sync-backend/main.go', './services/video-sync-backend/go.mod']),
    ])

# Frontend
docker_build('video-sync-frontend', './services/video-sync-frontend',
    live_update=[
        sync('./services/video-sync-frontend/src', '/app/src'),
        run('npm install', trigger='./services/video-sync-frontend/package.json'),
        run('npm run build', trigger=['./services/video-sync-frontend/src']),
    ])

# Redis
k8s_yaml('kubernetes/redis.yaml')

# Backend service
k8s_yaml('kubernetes/backend.yaml')
k8s_resource('video-sync-backend', port_forwards='8080:8080')

# Frontend service
k8s_yaml('kubernetes/frontend.yaml')
k8s_resource('video-sync-frontend', port_forwards='3000:3000')

# Resource dependencies
k8s_resource('video-sync-backend', resource_deps=['redis'])
k8s_resource('video-sync-frontend', resource_deps=['video-sync-backend'])