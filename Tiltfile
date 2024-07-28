# Tiltfile for Video Sync Project

# Backend
docker_build('video-sync-backend', './services/video-sync-backend',
    dockerfile='./services/video-sync-backend/Dockerfile',
    live_update=[
        sync('./services/video-sync-backend', '/app'),
        run('go build -o main .', trigger=['./services/video-sync-backend/main.go', './services/video-sync-backend/go.mod']),
    ])

# Backend Kubernetes deployment
k8s_yaml('kubernetes/backend.yaml')

# Resource configuration for backend
k8s_resource('video-sync-backend', port_forwards='8080:8080')

# Frontend
docker_build('video-sync-frontend', './services/video-sync-frontend',
    dockerfile='./services/video-sync-frontend/Dockerfile',
    live_update=[
        sync('./services/video-sync-frontend/src', '/app/src'),
        run('npm install', trigger='./services/video-sync-frontend/package.json'),
        run('npm run build', trigger=['./services/video-sync-frontend/src']),
    ])

# Frontend Kubernetes deployment
k8s_yaml('kubernetes/frontend.yaml')
k8s_resource('video-sync-frontend', port_forwards='3000:80')

# Resource dependencies
k8s_resource('video-sync-frontend', resource_deps=['video-sync-backend'])