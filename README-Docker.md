# RAG Mask - Docker Compose Setup Guide

This document explains how to run the RAG Mask application using Docker Compose.

## About the Project

RAG Mask is a Next.js application that performs text anonymization operations using Microsoft Presidio services. The application consists of the following services:

- **Presidio Analyzer**: Analyzes texts and detects sensitive data
- **Presidio Anonymizer**: Anonymizes detected sensitive data
- **Text Anonymizer Web App**: User interface and API services

## Requirements

- Docker (20.10 or higher)
- Docker Compose (2.0 or higher)
- At least 4GB RAM
- At least 2GB free disk space

## Quick Start

### 1. Clone the Project

```bash
git clone <repository-url>
cd rag-mask
```

### 2. Start the Application

#### Production Mode (Recommended)

```bash
docker compose up -d
```

This command starts the following services:
- Presidio Analyzer (Port: 5002)
- Presidio Anonymizer (Port: 5001)
- Text Anonymizer Web App (Port: 3000)

#### Development Mode

For development with hot reloading feature:

```bash
docker compose --profile dev up -d
```

This mode starts the following additional service:
- Text Anonymizer Dev (Port: 3001)

### 3. Access the Application

- **Main Application**: http://localhost:3000
- **Development Application**: http://localhost:3001 (dev mode only)
- **Presidio Analyzer API**: http://localhost:5002
- **Presidio Anonymizer API**: http://localhost:5001

## Detailed Usage

### Starting Services

```bash
# Start all services in background
docker compose up -d

# View logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f text-anonymizer
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Remove services and volumes
docker compose down -v

# Remove services, volumes and images
docker compose down --rmi all -v
```

### Restarting Services

```bash
# Restart all services
docker compose restart

# Restart a specific service
docker compose restart text-anonymizer
```

### Checking Service Status

```bash
# List running services
docker compose ps

# Check service health status
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

## Service Details

### Presidio Analyzer
- **Port**: 5002
- **Image**: mcr.microsoft.com/presidio-analyzer:latest
- **Purpose**: Analyzes texts and detects sensitive data
- **Health Check**: Checked every 30 seconds

### Presidio Anonymizer
- **Port**: 5001
- **Image**: mcr.microsoft.com/presidio-anonymizer:latest
- **Purpose**: Anonymizes detected sensitive data
- **Health Check**: Checked every 30 seconds

### Text Anonymizer Web App
- **Port**: 3000 (Production) / 3001 (Development)
- **Build**: Built using local Dockerfile
- **Purpose**: User interface and API services
- **Dependency**: Requires Presidio services to be healthy

## Environment Variables

### Production Environment
```yaml
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
PRESIDIO_ANALYZER_URL=http://presidio-analyzer:3000/analyze
PRESIDIO_ANONYMIZER_URL=http://presidio-anonymizer:3000/anonymize
```

### Development Environment
```yaml
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
PORT=3000
PRESIDIO_ANALYZER_URL=http://presidio-analyzer:3000
PRESIDIO_ANONYMIZER_URL=http://presidio-anonymizer:3000
```

## Troubleshooting

### Services Won't Start

1. **Check Docker and Docker Compose versions**:
   ```bash
   docker --version
   docker compose version
   ```

2. **Check for port conflicts**:
   ```bash
   # Check used ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5001
   netstat -tulpn | grep :5002
   ```

3. **Examine logs**:
   ```bash
   docker compose logs
   ```

### Presidio Services Unhealthy

1. **Check health check status**:
   ```bash
   docker compose ps
   ```

2. **Manually test Presidio services**:
   ```bash
   curl http://localhost:5002/
   curl http://localhost:5001/
   ```

3. **Restart services**:
   ```bash
   docker compose restart presidio-analyzer presidio-anonymizer
   ```

### Web Application Not Accessible

1. **Check web application status**:
   ```bash
   docker compose logs text-anonymizer
   ```

2. **Test API endpoint**:
   ```bash
   curl http://localhost:3000/api/analyze
   ```

3. **Check dependencies**:
   ```bash
   docker compose ps
   ```

## Performance Optimization

### Resource Usage

```bash
# Monitor container resource usage
docker stats

# Monitor specific container resource usage
docker stats text-anonymizer
```

### Memory and CPU Limits

You can add the following configurations to the Docker Compose file:

```yaml
services:
  text-anonymizer:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Development

### Running in Development Mode

```bash
# Start with development profile
docker compose --profile dev up -d

# Start only development service
docker compose up text-anonymizer-dev
```

### Monitoring Code Changes

In development mode, code changes are automatically detected and the application reloads.

### Debug Mode

```bash
# Start with debug logs
docker compose up --build
```

## Security

### Network Isolation

All services run in a dedicated Docker network called `text-anonymizer-network`.

### Port Access

- Only necessary ports are exposed to the outside world
- Presidio services are only accessible through internal network

## Backup and Restore

### Volume Backup

```bash
# Backup volumes
docker run --rm -v rag-mask_text-anonymizer-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```

### Restore

```bash
# Restore volumes
docker run --rm -v rag-mask_text-anonymizer-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

## Support

For issues:
1. Check this documentation
2. Review GitHub Issues section
3. Create a new issue

## License

This project is licensed under [license information].