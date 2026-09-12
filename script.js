/* ============================================================
   BURSA HIZLI TESLİMAT
   WHATSAPP TESLİMAT TALEP SİSTEMİ
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     AYARLAR
     ============================================================ */

  const WHATSAPP_NUMBER = "905539497449";
  const STORAGE_KEY = "bursaHizliTeslimatTalepleri";

  /* ============================================================
     ELEMENTLER
     ============================================================ */

  const deliveryForm = document.getElementById("deliveryForm");
  const formMessage = document.getElementById("formMessage");

  if (!deliveryForm) {
    console.warn("Teslimat formu bulunamadı.");
    return;
  }

  /* ============================================================
     SİPARİŞ NUMARASI
     ============================================================ */

  function generateOrderNumber() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const random = Math.floor(1000 + Math.random() * 9000);

    return `BHT-${year}${month}${day}-${random}`;
  }

  /* ============================================================
     FORM VERİLERİNİ AL
     ============================================================ */

  function getFormData() {
    const formData = new FormData(deliveryForm);

    return {
      id: generateOrderNumber(),

      name: (formData.get("name") || "").trim(),

      phone: (formData.get("phone") || "").trim(),

      pickup: (formData.get("pickup") || "").trim(),

      delivery: (formData.get("delivery") || "").trim(),

      packageType: (formData.get("packageType") || "").trim(),

      urgency: (formData.get("urgency") || "").trim(),

      description: (formData.get("description") || "").trim(),

      note: (formData.get("note") || "").trim(),

      status: "Yeni",

      createdAt: new Date().toISOString()
    };
  }

  /* ============================================================
     LOCAL STORAGE'A KAYDET
     ============================================================ */

  function saveRequest(request) {
    try {
      const oldRequests =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      oldRequests.push(request);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(oldRequests)
      );

      return true;
    } catch (error) {
      console.error("Talep kaydedilemedi:", error);
      return false;
    }
  }

  /* ============================================================
     MESAJ GÖSTER
     ============================================================ */

  function showMessage(message, type = "success") {
    if (!formMessage) return;

    formMessage.textContent = message;

    formMessage.classList.add("show");

    formMessage.style.display = "block";

    if (type === "error") {
      formMessage.style.borderColor = "rgba(255,98,98,.45)";
    } else {
      formMessage.style.borderColor = "rgba(25,195,125,.45)";
    }
  }

  function hideMessage() {
    if (!formMessage) return;

    formMessage.textContent = "";
    formMessage.classList.remove("show");
    formMessage.style.display = "none";
  }

  /* ============================================================
     WHATSAPP MESAJI OLUŞTUR
     ============================================================ */

  function createWhatsAppMessage(request) {
    const message = `
🏍️ BURSA HIZLI TESLİMAT
📦 YENİ TESLİMAT TALEBİ

━━━━━━━━━━━━━━━━━━

🔢 Talep No:
${request.id}

👤 Müşteri:
${request.name}

📞 Telefon:
${request.phone}

📍 Alınacak Adres:
${request.pickup}

📍 Teslim Edilecek Adres:
${request.delivery}

📦 Paket Türü:
${request.packageType || "Belirtilmedi"}

⚡ Teslimat Önceliği:
${request.urgency || "Normal"}

📝 Açıklama:
${request.description || "Belirtilmedi"}

📌 Not:
${request.note || "Yok"}

━━━━━━━━━━━━━━━━━━

🚀 Bursa Hızlı Teslimat
`;

    return message.trim();
  }

  /* ============================================================
     WHATSAPP'I AÇ
     ============================================================ */

  function openWhatsApp(request) {
    const message = createWhatsAppMessage(request);

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  /* ============================================================
     TELEFON NUMARASI DÜZENLE
     ============================================================ */

  const phoneInput = deliveryForm.querySelector("#phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "");

      if (value.length > 0 && value.charAt(0) !== "0") {
        value = "0" + value;
      }

      value = value.substring(0, 11);

      this.value = value;
    });
  }

  /* ============================================================
     FORM GÖNDERME
     ============================================================ */

  deliveryForm.addEventListener("submit", function (event) {
    event.preventDefault();

    hideMessage();

    const request = getFormData();

    /* ----------------------------------------------------------
       ZORUNLU ALAN KONTROLLERİ
       ---------------------------------------------------------- */

    if (!request.name) {
      showMessage("Lütfen adınızı ve soyadınızı yazın.", "error");
      return;
    }

    if (!request.phone) {
      showMessage("Lütfen telefon numaranızı yazın.", "error");
      return;
    }

    if (request.phone.length < 10) {
      showMessage("Lütfen geçerli bir telefon numarası yazın.", "error");
      return;
    }

    if (!request.pickup) {
      showMessage("Lütfen paketin alınacağı adresi yazın.", "error");
      return;
    }

    if (!request.delivery) {
      showMessage("Lütfen teslimat adresini yazın.", "error");
      return;
    }

    /* ----------------------------------------------------------
       TALEBİ KAYDET
       ---------------------------------------------------------- */

    saveRequest(request);

    /* ----------------------------------------------------------
       KULLANICIYA BİLGİ VER
       ---------------------------------------------------------- */

    showMessage(
      `✅ Talebiniz hazırlandı. Talep No: ${request.id} — WhatsApp açılıyor...`,
      "success"
    );

    /* ----------------------------------------------------------
       WHATSAPP'I AÇ
       ---------------------------------------------------------- */

    setTimeout(() => {
      openWhatsApp(request);
    }, 500);

    /* ----------------------------------------------------------
       FORMU TEMİZLE
       ---------------------------------------------------------- */

    setTimeout(() => {
      deliveryForm.reset();
    }, 1000);

    /* ----------------------------------------------------------
       MESAJI GÖSTER
       ---------------------------------------------------------- */

    if (formMessage) {
      setTimeout(() => {
        formMessage.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);
    }
  });

  /* ============================================================
     SAYFA İÇİ YUMUŞAK KAYDIRMA
     ============================================================ */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* ============================================================
     SİSTEM HAZIR
     ============================================================ */

  console.log(
    "🏍️ Bursa Hızlı Teslimat sistemi hazır."
  );

  console.log(
    "📱 WhatsApp teslimat numarası:",
    WHATSAPP_NUMBER
  );

})();
