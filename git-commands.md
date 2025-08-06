# 🚀 Git'e Yükleme Komutları

Bu dosya, Telegram Mini App backend projesini GitHub'a yüklemek için gerekli tüm komutları içerir.

## 📋 Ön Gereksinimler

1. **Git kurulu olmalı**
2. **GitHub hesabınız olmalı**
3. **GitHub'da repository oluşturmuş olmalısınız**

## 🔧 Git Konfigürasyonu (İlk kez ise)

```bash
# Git kullanıcı bilgilerini ayarla
git config --global user.name "Loyan Hakan"
git config --global user.email "your-email@example.com"

# Git credential helper ayarla (Windows için)
git config --global credential.helper wincred
```

## 📁 Proje Klasörüne Git

```bash
# Proje klasörüne git
cd C:\Users\loyan\Desktop\webapp
```

## 🔄 Git Repository'sini Başlat

```bash
# Git repository'sini başlat
git init

# Remote repository'yi ekle (GitHub URL'inizi kullanın)
git remote add origin https://github.com/loyanhakan/webapp.git

# Remote'u kontrol et
git remote -v
```

## 📝 İlk Commit'i Hazırla

```bash
# Tüm dosyaları staging area'ya ekle
git add .

# İlk commit'i oluştur
git commit -m "🚀 Initial commit: Telegram Mini App Backend API

- Express.js server with JWT authentication
- PostgreSQL database integration with Neon.tech
- Telegram Web App validation utilities
- Comprehensive API endpoints
- Security features (rate limiting, CORS, Helmet)
- Session management and activity logging
- Testing interface included"
```

## 🚀 GitHub'a Push Et

```bash
# Main branch'ini oluştur ve değiştir
git branch -M main

# GitHub'a push et
git push -u origin main
```

## 🔄 Sonraki Güncellemeler İçin

```bash
# Değişiklikleri kontrol et
git status

# Değişiklikleri staging'e ekle
git add .

# Commit oluştur
git commit -m "📝 Update description: What you changed"

# Push et
git push
```

## 🛠️ Ek Faydalı Komutlar

```bash
# Commit geçmişini görüntüle
git log --oneline

# Branch'leri listele
git branch

# Remote repository bilgilerini görüntüle
git remote -v

# Son commit'i geri al (dikkatli kullanın)
git reset --soft HEAD~1

# Değişiklikleri stash'le
git stash

# Stash'lenen değişiklikleri geri al
git stash pop
```

## ⚠️ Önemli Notlar

1. **`.env` dosyası `.gitignore`'da olduğu için yüklenmeyecek** ✅
2. **`node_modules` klasörü yüklenmeyecek** ✅
3. **Sadece `env.example` dosyası yüklenecek** ✅

## 🔐 Güvenlik Kontrolü

```bash
# Hangi dosyaların commit edileceğini kontrol et
git status

# Staging area'daki dosyaları kontrol et
git diff --cached
```

## 📱 Railway Deployment Sonrası

```bash
# Railway'e deploy ettikten sonra environment variables'ları ayarlayın
# Railway dashboard'da .env dosyasındaki tüm değişkenleri ekleyin
```

## 🎯 Tam Komut Sırası

```bash
# 1. Git konfigürasyonu
git config --global user.name "Loyan Hakan"
git config --global user.email "your-email@example.com"

# 2. Proje klasörüne git
cd C:\Users\loyan\Desktop\webapp

# 3. Git başlat
git init

# 4. Remote ekle
git remote add origin https://github.com/loyanhakan/webapp.git

# 5. Dosyaları ekle
git add .

# 6. İlk commit
git commit -m "🚀 Initial commit: Telegram Mini App Backend API"

# 7. Main branch oluştur
git branch -M main

# 8. GitHub'a push
git push -u origin main
```

## ✅ Başarı Kontrolü

Push işleminden sonra GitHub'da şunları görmelisiniz:

- ✅ `server.js` - Ana server dosyası
- ✅ `package.json` - Dependencies ve scripts
- ✅ `README.md` - Proje dokümantasyonu
- ✅ `database/schema.sql` - Database şeması
- ✅ `utils/` klasörü - Utility dosyaları
- ✅ `public/index.html` - Test interface
- ✅ `.gitignore` - Git ignore kuralları
- ✅ `env.example` - Environment variables template

**❌ `.env` dosyası görünmemeli** (güvenlik için)

---

**🎉 Tebrikler! Projeniz GitHub'a başarıyla yüklendi!** 