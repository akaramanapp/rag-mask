# Text Anonymizer - Docker Deployment

Bu proje Docker kullanılarak kolayca deploy edilebilir. Microsoft Presidio servisleri de dahil edilmiştir.

## 🐳 Docker ile Çalıştırma

### Production Deployment (Tüm Servisler)

```bash
# Tüm servisleri (Presidio + Web App) başlatma
docker-compose up --build

# Arka planda çalıştırma
docker-compose up -d --build
```

### Development Deployment

```bash
# Development modunda çalıştırma (hot reload ile)
docker-compose --profile dev up --build

# Arka planda development modunda çalıştırma
docker-compose --profile dev up -d --build
```

### Sadece Presidio Servisleri

```bash
# Sadece Presidio servislerini başlatma
docker-compose up presidio-analyzer presidio-anonymizer

# Arka planda
docker-compose up -d presidio-analyzer presidio-anonymizer
```

### Manuel Docker Build

```bash
# Production image build
docker build -t text-anonymizer .

# Development image build
docker build -f Dockerfile.dev -t text-anonymizer:dev .

# Production container çalıştırma
docker run -p 3000:3000 text-anonymizer

# Development container çalıştırma
docker run -p 3001:3000 -v $(pwd):/app text-anonymizer:dev
```

## 📋 Kullanılabilir Komutlar

```bash
# Tüm servisleri durdurma
docker-compose down

# Servisleri ve volume'ları temizleme
docker-compose down -v

# Logları görüntüleme
docker-compose logs -f

# Belirli servisin loglarını görüntüleme
docker-compose logs -f text-anonymizer
docker-compose logs -f presidio-analyzer
docker-compose logs -f presidio-anonymizer

# Container'ları yeniden başlatma
docker-compose restart

# Image'ları temizleme
docker system prune -a

# Servis durumlarını kontrol etme
docker-compose ps
```

## 🌐 Erişim

- **Web Application**: http://localhost:3000
- **Development**: http://localhost:3001
- **Presidio Analyzer**: http://localhost:5002
- **Presidio Anonymizer**: http://localhost:5001

## 🔧 Servisler

### 1. **text-anonymizer** (Ana Uygulama)
- **Port**: 3000
- **Açıklama**: Next.js web uygulaması
- **Bağımlılık**: presidio-analyzer, presidio-anonymizer

### 2. **presidio-analyzer** (Microsoft Presidio)
- **Port**: 5002
- **Açıklama**: Hassas veri analizi servisi
- **Image**: mcr.microsoft.com/presidio-analyzer:latest

### 3. **presidio-anonymizer** (Microsoft Presidio)
- **Port**: 5001
- **Açıklama**: Veri anonimleştirme servisi
- **Image**: mcr.microsoft.com/presidio-anonymizer:latest

## 🔧 Environment Variables

Gerekirse aşağıdaki environment variable'ları `docker-compose.yml` dosyasına ekleyebilirsiniz:

```yaml
environment:
  - NODE_ENV=production
  - NEXT_TELEMETRY_DISABLED=1
  - PORT=3000
```

## 📁 Dosya Yapısı

```
.
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Docker Compose konfigürasyonu (Presidio servisleri dahil)
├── .dockerignore           # Docker build context'inden hariç tutulacak dosyalar
└── README-Docker.md        # Bu dosya
```

## 🚀 Deployment Önerileri

1. **Production**: `docker-compose up -d --build` kullanın
2. **Development**: `docker-compose --profile dev up --build` kullanın
3. **Monitoring**: `docker-compose logs -f` ile logları takip edin
4. **Updates**: Kod değişikliklerinden sonra `--build` flag'i ile yeniden build edin
5. **Health Checks**: Servislerin sağlık durumunu kontrol edin

## 🔍 Troubleshooting

### Port çakışması
Eğer portlar kullanımdaysa, `docker-compose.yml` dosyasında port mapping'i değiştirin:

```yaml
ports:
  - "3001:3000"  # Web app port'u
  - "5003:3000"  # Analyzer port'u
  - "5004:3000"  # Anonymizer port'u
```

### Presidio servisleri başlamıyor
```bash
# Servislerin durumunu kontrol edin
docker-compose ps

# Logları inceleyin
docker-compose logs presidio-analyzer
docker-compose logs presidio-anonymizer

# Servisleri yeniden başlatın
docker-compose restart presidio-analyzer presidio-anonymizer
```

### Build hatası
```bash
# Cache'i temizleyin
docker system prune -a

# Yeniden build edin
docker-compose build --no-cache
```

### Permission hatası
```bash
# Container'ı root olarak çalıştırın (sadece development için)
docker run -p 3000:3000 --user root text-anonymizer:dev
```

### Servis bağımlılıkları
Ana uygulama Presidio servislerinin hazır olmasını bekler. Eğer bağlantı hatası alırsanız:

```bash
# Tüm servisleri sırayla başlatın
docker-compose up presidio-analyzer presidio-anonymizer -d
docker-compose up text-anonymizer -d
```

## 🔒 Güvenlik Notları

- Presidio servisleri production ortamında güvenlik duvarı arkasında çalıştırılmalıdır
- Hassas veriler container loglarında görünebilir, log seviyesini kontrol edin
- Network izolasyonu için custom network kullanılmıştır
