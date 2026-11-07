# AnatoLearn — Dolaşım Kurulu Prototipi

Vanilla HTML, CSS ve JavaScript ile hazırlanmış, backend/veritabanı gerektirmeyen ilk çalışan prototip.

## İçerik
- Ana sayfa ve kurul kartları
- Dolaşım Sistemi kurul sayfası
- Kalp Anatomisi konu sayfası
- JSON dosyasından yüklenen görsel çoktan seçmeli test
- SVG ok işaretleme katmanı
- ID tabanlı cevap kontrolü
- Doğru/yanlış geri bildirimi ve açıklama
- İlerleme çubuğu ve sonuç ekranı
- Konu ve zorluk filtreleri
- Mobil/tablet uyumlu arayüz

## Çalıştırma
`fetch()` ile JSON dosyası yüklendiği için dosyayı doğrudan çift tıklayarak açmak yerine yerel HTTP sunucusu kullanın.

### Python ile
Terminalde proje klasörüne girin:
```bash
cd AnatoLearn
python -m http.server 8000
```
Tarayıcıda `http://localhost:8000` adresini açın.

### VS Code ile
1. AnatoLearn klasörünü VS Code ile açın.
2. Live Server eklentisini kurun.
3. `index.html` üzerinde sağ tıklayın.
4. “Open with Live Server” seçeneğini seçin.

## Dosya düzeni
- `index.html`: Sayfa iskeleti ve tüm görünüm bölümleri.
- `css/style.css`: Renkler, tipografi, bileşenler ve responsive kurallar.
- `js/app.js`: Navigasyon, JSON yükleme, soru akışı, cevap kontrolü ve sonuç hesabı.
- `data/questions.json`: Soru verileri.
- `assets/images/heart/`: Kalp görselleri.

## Yeni soru ekleme
`data/questions.json` dizisine yeni bir nesne ekleyin. Her soru:
- benzersiz `id` taşımalı,
- tam dört seçenek içermeli,
- seçenek `id` değerleri kendi içinde benzersiz olmalı,
- `correctOptionId` seçeneklerden birinin `id` değeriyle eşleşmeli,
- marker başlangıç ve bitiş koordinatları 0–1 aralığında olmalı,
- görsel yolu mevcut bir dosyayı göstermeli.

Örnek:
```json
"marker": {
  "type": "arrow",
  "start": {"x": 0.72, "y": 0.25},
  "end": {"x": 0.61, "y": 0.48}
}
```
Koordinatlar görselin genişlik ve yüksekliğine oranlıdır. Görsel ve SVG katmanı aynı `10:7` alanı paylaşır.

## Önemli anatomik not
`assets/images/heart/heart-internal-schematic.svg` bu prototip için özgün ve basitleştirilmiş bir eğitim şemasıdır; ölçekli/atlas doğruluğunda anatomik çizim değildir. Sınav veya klinik eğitim içeriği olarak yayımlanmadan önce lisanslı, anatomik doğruluğu kontrol edilmiş bir atlas görseliyle değiştirilmeli ve her marker koordinatı uzman kontrolünden geçirilmelidir.

## Bilinen kapsam sınırları
- Backend ve kullanıcı hesabı yoktur.
- Sonuçlar kalıcı olarak kaydedilmez.
- Soru havuzu prototip amacıyla 5 sorudur.
- Dolaşım dışındaki kurullar “yakında” durumundadır.
- Görsel lisans/atıf envanteri bu prototipe dahil değildir.
