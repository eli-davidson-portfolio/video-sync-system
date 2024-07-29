# Tiltfile for Video Sync Project

# Load environment variables (if you're using .env file)
load('ext://dotenv', 'dotenv')
dotenv()

# Backend
docker_build(
    'video-sync-backend',
    context='./services/video-sync-backend',
    dockerfile='./services/video-sync-backend/Dockerfile',
    live_update=[
        sync('./services/video-sync-backend', '/app'),
        run('go build -o main .', trigger=['./services/video-sync-backend/main.go', './services/video-sync-backend/go.mod']),
    ],
)

# Frontend
docker_build(
    'video-sync-frontend',
    context='./services/video-sync-frontend',
    dockerfile='./services/video-sync-frontend/Dockerfile',
    live_update=[
        sync('./services/video-sync-frontend/src', '/app/src'),
        run('npm install --legacy-peer-deps', trigger='./services/video-sync-frontend/package.json'),
        run('npm run build', trigger=['./services/video-sync-frontend/src']),
    ],
)

# Function to load all Kubernetes YAML files
def load_kubernetes_yaml():
    kubernetes_dir = './kubernetes'
    yaml_files = str(local('ls {}/*.yaml'.format(kubernetes_dir), quiet=True)).split('\n')
    return [k8s_yaml(f.strip()) for f in yaml_files if f.strip()]

# Load Kubernetes configurations
load_kubernetes_yaml()

# Resource configuration
k8s_resource('video-sync-backend', port_forwards='8080:8080', labels=['backend'])
k8s_resource('video-sync-frontend', port_forwards='3000:80', labels=['frontend'])

# Resource dependencies
k8s_resource('video-sync-frontend', resource_deps=['video-sync-backend'])

# Watch for changes in Kubernetes config files
watch_file('./kubernetes')