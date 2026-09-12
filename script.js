/* ============================================================
   BURSA HIZLI TESLİMAT
   script.js
   Teslimat formu + WhatsApp + kullanıcı işlemleri
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     TEMEL AYARLAR
     ============================================================ */

  const WHATSAPP_NUMBER = "905539497449";
  const BUSINESS_PHONE = "05539497449";

  /* ============================================================
     YARDIMCI FONKSİYONLAR
     ============================================================ */

  const $ = (selector, root = document) => {
    return root.querySelector(selector);
  };

  const $$ = (selector, root = document) => {
    return [...root.querySelectorAll(selector)];
  };

  const clean = (value) => {
    return String(value || "").trim();
  };

  const escapeText = (value) => {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /* ============================================================
     SAYFA YÜKLENDİĞİNDE
     ============================================================ */

  document.addEventListener("DOMContentLoaded", () => {
    initSmoothScroll();
    initDeliveryForm();
    initPhoneFormatting();
    initHeaderScroll();
    initRevealAnimations();
    initContactLinks();
  });

  /* ============================================================
     YUMUŞAK KAYDIRMA
     ============================================================ */

  function initSmoothScroll() {
    const links = $$('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        /*
         * Mobil menü varsa kapat.
         */
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* ============================================================
     TESLİMAT FORMU
     ============================================================ */

  function initDeliveryForm() {
    const form = $("#deliveryForm");

    if (!form) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      clearFormMessage();

      const name = clean($("#name")?.value);
      const phone = clean($("#phone")?.value);
      const pickup = clean($("#pickup")?.value);
      const delivery = clean($("#delivery")?.value);
      const packageType = clean($("#packageType")?.value);
      const urgency = clean($("#urgency")?.value) || "Normal";
      const description = clean($("#description")?.value);
      const note = clean($("#note")?.value);

      /* --------------------------------------------------------
         ZORUNLU ALAN KONTROLLERİ
         -------------------------------------------------------- */

      if (!name) {
        showFormMessage(
          "Lütfen adınızı ve soyadınızı yazın.",
          "error"
        );

        focusField("#name");
        return;
      }

      if (!phone) {
        showFormMessage(
          "Lütfen telefon numaranızı yazın.",
          "error"
        );

        focusField("#phone");
        return;
      }

      if (!isValidTurkishPhone(phone)) {
        showFormMessage(
          "Lütfen geçerli bir telefon numarası girin.",
          "error"
        );

        focusField("#phone");
        return;
      }

      if (!pickup) {
        showFormMessage(
          "Lütfen paketin alınacağı adresi yazın.",
          "error"
        );

        focusField("#pickup");
        return;
      }

      if (!delivery) {
        showFormMessage(
          "Lütfen paketin teslim edileceği adresi yazın.",
          "error"
        );

        focusField("#delivery");
        return;
      }

      /* --------------------------------------------------------
         WHATSAPP MESAJI
         -------------------------------------------------------- */

      const message = buildWhatsAppMessage({
        name,
        phone,
        pickup,
        delivery,
        packageType,
        urgency,
        description,
        note
      });

      const whatsappUrl =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      /* --------------------------------------------------------
         BAŞARILI MESAJ
         -------------------------------------------------------- */

      showFormMessage(
        "Teslimat bilgileriniz hazırlandı. WhatsApp açılıyor...",
        "success"
      );

      /*
       * Küçük gecikme kullanıcıya başarı mesajını görme imkanı verir.
       */
      setTimeout(() => {
        window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }, 350);
    });
  }

  /* ============================================================
     WHATSAPP MESAJI OLUŞTUR
     ============================================================ */

  function buildWhatsAppMessage(data) {
    const {
      name,
      phone,
      pickup,
      delivery,
      packageType,
      urgency,
      description,
      note
    } = data;

    let message = "";

    message += "🏍️ BURSA HIZLI TESLİMAT\n";
    message += "📦 YENİ TESLİMAT TALEBİ\n";
    message += "━━━━━━━━━━━━━━━━━━━━\n\n";

    message += `👤 Ad Soyad: ${name}\n`;
    message += `📞 Telefon: ${phone}\n\n`;

    message += "📍 ALINACAK ADRES\n";
    message += `${pickup}\n\n`;

    message += "🏁 TESLİM EDİLECEK ADRES\n";
    message += `${delivery}\n\n`;

    message += "📦 PAKET BİLGİLERİ\n";

    if (packageType) {
      message += `Paket Türü: ${packageType}\n`;
    } else {
      message += "Paket Türü: Belirtilmedi\n";
    }

    message += `⚡ Aciliyet: ${urgency}\n`;

    if (description) {
      message += `📝 Açıklama: ${description}\n`;
    }

    if (note) {
      message += `💬 Ek Not: ${note}\n`;
    }

    message += "\n";
    message += "━━━━━━━━━━━━━━━━━━━━\n";
    message += "Bu talep Bursa Hızlı Teslimat web sitesinden oluşturulmuştur.";

    return message;
  }

  /* ============================================================
     TELEFON NUMARASI FORMATLAMA
     ============================================================ */

  function initPhoneFormatting() {
    const phoneInput = $("#phone");

    if (!phoneInput) {
      return;
    }

    phoneInput.addEventListener("input", () => {
      let value = phoneInput.value;

      /*
       * Sadece rakamları bırak.
       */
      value = value.replace(/\D/g, "");

      /*
       * Türkiye numarası +90 ile yazılırsa
       * 0 ile başlayan formata dönüştür.
       */
      if (value.startsWith("90") && value.length > 10) {
        value = "0" + value.substring(2);
      }

      /*
       * Başta 0 yoksa ve 10 haneliyse 0 ekle.
       */
      if (
        value.length === 10 &&
        !value.startsWith("0")
      ) {
        value = "0" + value;
      }

      /*
       * Maksimum 11 rakam.
       */
      value = value.substring(0, 11);

      phoneInput.value = formatTurkishPhone(value);
    });
  }

  function formatTurkishPhone(value) {
    const digits = String(value || "").replace(/\D/g, "");

    if (digits.length <= 4) {
      return digits;
    }

    if (digits.length <= 7) {
      return `${digits.substring(0, 4)} ${digits.substring(4)}`;
    }

    if (digits.length <= 9) {
      return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
    }

    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7, 9)} ${digits.substring(9, 11)}`;
  }

  /* ============================================================
     TELEFON DOĞRULAMA
     ============================================================ */

  function isValidTurkishPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    /*
     * Türkiye cep telefonu:
     * 05XXXXXXXXX
     */
    if (!/^05\d{9}$/.test(digits)) {
      return false;
    }

    return true;
  }

  /* ============================================================
     FORM MESAJLARI
     ============================================================ */

  function showFormMessage(message, type = "success") {
    const box = $("#formMessage");

    if (!box) {
      return;
    }

    box.textContent = message;

    box.classList.remove(
      "success",
      "error",
      "show"
    );

    box.classList.add(type);

    /*
     * CSS'de .show varsa görünür hale gelir.
     */
    requestAnimationFrame(() => {
      box.classList.add("show");
    });
  }

  function clearFormMessage() {
    const box = $("#formMessage");

    if (!box) {
      return;
    }

    box.textContent = "";

    box.classList.remove(
      "success",
      "error",
      "show"
    );
  }

  /* ============================================================
     ALANA ODAKLAN
     ============================================================ */

  function focusField(selector) {
    const field = $(selector);

    if (!field) {
      return;
    }

    field.focus();

    /*
     * Kullanıcının ekranda alanı görmesini sağlar.
     */
    setTimeout(() => {
      field.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 50);
  }

  /* ============================================================
     HEADER SCROLL
     ============================================================ */

  function initHeaderScroll() {
    const header = $(".site-header");

    if (!header) {
      return;
    }

    const updateHeader = () => {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }

  /* ============================================================
     GÖRÜNÜR OLMA ANİMASYONLARI
     ============================================================ */

  function initRevealAnimations() {
    const elements = [
      ...$$(".step-card"),
      ...$$(".service-card"),
      ...$$(".contact-card"),
      ...$$(".quick-item"),
      ...$$(".hero-feature"),
      ...$$(".delivery-intro"),
      ...$$(".form-card")
    ];

    if (!elements.length) {
      return;
    }

    /*
     * IntersectionObserver desteklenmiyorsa
     * her şeyi direkt göster.
     */
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("visible");

          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  /* ============================================================
     TELEFON / WHATSAPP LİNKLERİ
     ============================================================ */

  function initContactLinks() {
    const whatsappLinks = $$(
      'a[href*="wa.me"]'
    );

    whatsappLinks.forEach((link) => {
      link.addEventListener("click", () => {
        /*
         * WhatsApp bağlantısı doğrudan çalışır.
         * Burada ekstra işlem yapılmaz.
         */
      });
    });

    const phoneLinks = $$(
      'a[href^="tel:"]'
    );

    phoneLinks.forEach((link) => {
      link.addEventListener("click", () => {
        /*
         * Mobil cihazlarda telefon uygulaması açılır.
         */
      });
    });
  }

  /* ============================================================
     GLOBAL OLARAK KULLANILABİLECEK FONKSİYONLAR
     ============================================================ */

  window.BursaHizliTeslimat = {
    buildWhatsAppMessage,
    isValidTurkishPhone,
    formatTurkishPhone
  };

})();
