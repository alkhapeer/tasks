/* ============================================================
   Hero Tasks — Service Worker
   ------------------------------------------------------------
   القاعدة الأساسية:
   - لا نستخدم Cache Storage إطلاقًا.
   - كل الطلبات تمر مباشرة إلى الشبكة.
   - الهدف الوحيد: تمكين التثبيت (PWA) والتحكم بالدورة العمرية.
   ============================================================ */

const SW_VERSION = "hero-sw-v1";

/* ---------- install: تفعيل فوري بدون تحميل أي ملف ---------- */
self.addEventListener("install", (event) => {
  // لا نستخدم skipWaiting هنا تلقائيًا،
  // حتى لا نُجبر المستخدم على إعادة التحميل دون علمه.
});

/* ---------- activate: تنظيف أي كاش قديم إن وجد ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // حذف كل مخازن الكاش القديمة إن وُجدت من نسخة سابقة
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // لا شيء — تجاهل
      }
      // تفعيل فوري للـ SW الجديد
      await self.clients.claim();
    })()
  );
});

/* ---------- message: السماح للصفحة بطلب التحديث ---------- */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ---------- fetch: تمرير كل شيء إلى الشبكة ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // نتجاهل الطلبات غير GET (POST لـ Apps Script، إلخ)
  if (req.method !== "GET") return;

  // نتجاهل أي طلب ليس من نفس الأصل (Google Fonts, GAS, إلخ)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // network-only: كل شيء يمر للشبكة مباشرة. لا cache.put، لا cache.match.
  event.respondWith(
    fetch(req).catch(() => {
      // إذا فشلت الشبكة، لا نُعيد نسخة قديمة — نُعيد خطأ واضح
      return new Response(
        JSON.stringify({ ok: false, offline: true, message: "لا يوجد اتصال بالشبكة." }),
        { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    })
  );
});
