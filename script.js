/* ============================================================
   BURSA HIZLI TESLİMAT
   TESLİMAT TALEBİ + WHATSAPP SİSTEMİ
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     AYARLAR
     ============================================================ */

  const WHATSAPP_NUMBER = "905539497449";
  const STORAGE_KEY = "bursaHizliTeslimatTalepleri";

  /* ============================================================
     FORM
     ============================================================ */

  const deliveryForm = document.getElementById("deliveryForm");
  const formMessage = document.getElementById("formMessage");

  if (!deliveryForm) {
    console.warn("Teslimat formu bulunamadı.");
    return;
  }

  /* ============================================================
     TALEP NUMARASI
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
     FORM BİLGİLERİNİ AL
     ============================================================ */

  function getFormData() {
    const data = new FormData(deliveryForm);

    return {
      id: generateOrderNumber(),

      name: (data.get("name") || "").trim(),

      phone: (data.get("phone") || "").trim(),

      pickup: (data.get("pickup") || "").trim(),

      delivery: (data.get("delivery") || "").trim(),

      packageType: (data.get("packageType") || "").trim(),

      urgency: (data.get("urgency") || "Normal").trim(),

      description: (data.get("description") || "").trim(),

      note: (data.get("note") || "").trim(),

      status: "Yeni",

      createdAt: new Date().toISOString()
    };
  }

  /* ============================================================
     LOCAL STORAGE
     ============================================================ */

  function saveRequest(request) {
    try {
      const requests =
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      requests.push(request);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(requests)
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
      formMessage.style.borderColor =
        "rgba(255,98,98,.45)";
    } else {
      formMessage.style.borderColor =
        "rgba(25,195,125,.45)";
    }
  }

  function hideMessage() {
    if (!formMessage) return;

    formMessage.textContent = "";

    formMessage.classList.remove("show");

    formMessage.style.display = "none";
  }

  /* ============================================================
     WHATSAPP MESAJI
     
     Bilerek Türkçe karakter ve emoji kullanmıyoruz.
     Böylece WhatsApp'ta � karakteri oluşmaz.
     ============================================================ */

  function createWhatsAppMessage(request) {
    const message = `
BURSA HIZLI TESLIMAT
YENI TESLIMAT TALEBI

==============================

Talep No:
${request.id}

Musteri:
${request.name}

Telefon:
${request.phone}

Alinacak Adres:
${request.pickup}

Teslim Edilecek Adres:
${request.delivery}

Paket Turu:
${request.packageType || "Belirtilmedi"}

Teslimat Onceligi:
${request.urgency || "Normal"}

Paket Aciklamasi:
${request.description || "Belirtilmedi"}

Ek Not:
${request.note || "Yok"}

==============================

Bursa Hizli Teslimat
`;

    return message.trim();
  }

  /* ============================================================
     WHATSAPP AÇ
     ============================================================ */

  function openWhatsApp(request) {
    const message = createWhatsAppMessage(request);

    const whatsappUrl =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* ============================================================
     TELEFON NUMARASI
     ============================================================ */

  const phoneInput =
    deliveryForm.querySelector("#phone");

  if (phoneInput) {

    phoneInput.addEventListener("input", function () {

      let value =
        this.value.replace(/\D/g, "");

      if (
        value.length > 0 &&
        value.charAt(0) !== "0"
      ) {
        value = "0" + value;
      }

      value = value.substring(0, 11);

      this.value = value;

    });

  }

  /* ============================================================
     FORM GÖNDERME
     ============================================================ */

  deliveryForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      hideMessage();

      const request = getFormData();

      /* --------------------------------------------------------
         AD SOYAD
         -------------------------------------------------------- */

      if (!request.name) {

        showMessage(
          "Lutfen adinizi ve soyadinizi yazin.",
          "error"
        );

        return;
      }

      /* --------------------------------------------------------
         TELEFON
         -------------------------------------------------------- */

      if (!request.phone) {

        showMessage(
          "Lutfen telefon numaranizi yazin.",
          "error"
        );

        return;
      }

      if (request.phone.length < 10) {

        showMessage(
          "Lutfen gecerli bir telefon numarasi yazin.",
          "error"
        );

        return;
      }

      /* --------------------------------------------------------
         ALINACAK ADRES
         -------------------------------------------------------- */

      if (!request.pickup) {

        showMessage(
          "Lutfen paketin alinacagi adresi yazin.",
          "error"
        );

        return;
      }

      /* --------------------------------------------------------
         TESLIM ADRESI
         -------------------------------------------------------- */

      if (!request.delivery) {

        showMessage(
          "Lutfen teslimat adresini yazin.",
          "error"
        );

        return;
      }

      /* --------------------------------------------------------
         KAYDET
         -------------------------------------------------------- */

      saveRequest(request);

      /* --------------------------------------------------------
         BASARILI MESAJ
         -------------------------------------------------------- */

      showMessage(
        "Talebiniz hazirlandi. Talep No: " +
        request.id +
        " - WhatsApp aciliyor..."
      );

      /* --------------------------------------------------------
         WHATSAPP
         -------------------------------------------------------- */

      setTimeout(() => {

        openWhatsApp(request);

      }, 500);

      /* --------------------------------------------------------
         FORMU TEMIZLE
         -------------------------------------------------------- */

      setTimeout(() => {

        deliveryForm.reset();

      }, 1000);

      /* --------------------------------------------------------
         MESAJ ALANINA KAYDIR
         -------------------------------------------------------- */

      setTimeout(() => {

        if (formMessage) {

          formMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        }

      }, 100);

    }
  );

  /* ============================================================
     SAYFA İÇİ YUMUŞAK KAYDIRMA
     ============================================================ */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener(
        "click",
        function (event) {

          const targetId =
            this.getAttribute("href");

          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }

          const target =
            document.querySelector(targetId);

          if (!target) {
            return;
          }

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    });

  /* ============================================================
     SİSTEM HAZIR
     ============================================================ */

  console.log(
    "Bursa Hizli Teslimat sistemi hazir."
  );

  console.log(
    "WhatsApp:",
    WHATSAPP_NUMBER
  );

})();
