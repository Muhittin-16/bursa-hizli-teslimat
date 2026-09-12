/* ============================================================
   BURSA HIZLI TESLİMAT
   script.js
   Mobil teslimat sistemi + Supabase + WhatsApp
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     AYARLAR
     ============================================================ */

  const SUPABASE_URL =
    "https://cwfkrwfvxurmtjkvllul.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Kg3VNlkTYcjRDctC5RHPxA_eaX7YkCA";

  const WHATSAPP_NUMBER = "905539497449";
  const BUSINESS_PHONE = "05539497449";

  let supabase = null;

  /* ============================================================
     YARDIMCI SEÇİCİLER
     ============================================================ */

  const $ = (selector) => document.querySelector(selector);

  /* ============================================================
     SUPABASE BAĞLANTISI
     ============================================================ */

  async function initSupabase() {
    if (supabase) {
      return supabase;
    }

    try {
      const module = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );

      supabase = module.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );

      return supabase;
    } catch (error) {
      console.error("Supabase bağlantı hatası:", error);
      throw error;
    }
  }

  /* ============================================================
     TELEFON
     ============================================================ */

  function cleanPhone(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function isValidTurkishPhone(value) {
    let digits = cleanPhone(value);

    if (digits.startsWith("90")) {
      digits = "0" + digits.substring(2);
    }

    if (!digits.startsWith("0")) {
      digits = "0" + digits;
    }

    return /^05\d{9}$/.test(digits);
  }

  function formatTurkishPhone(value) {
    let digits = cleanPhone(value);

    if (digits.startsWith("90") && digits.length === 12) {
      digits = "0" + digits.substring(2);
    }

    if (digits.length > 11) {
      digits = digits.substring(0, 11);
    }

    if (!digits) {
      return "";
    }

    let result = digits.substring(0, 4);

    if (digits.length > 4) {
      result += " " + digits.substring(4, 7);
    }

    if (digits.length > 7) {
      result += " " + digits.substring(7, 9);
    }

    if (digits.length > 9) {
      result += " " + digits.substring(9, 11);
    }

    return result;
  }

  /* ============================================================
     SİPARİŞ NUMARASI
     ÖNEMLİ:
     Artık INSERT sonrası SELECT yapılmıyor.
     Bu sayede anonim mobil kullanıcı sipariş oluşturabiliyor.
     ============================================================ */

  function generateOrderNumber() {
    try {
      const array = new Uint8Array(4);
      crypto.getRandomValues(array);

      const randomPart = Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

      return "BHT-" + randomPart;
    } catch (error) {
      const randomPart = Math.random()
        .toString(16)
        .substring(2, 10)
        .toUpperCase();

      return "BHT-" + randomPart;
    }
  }

  /* ============================================================
     WHATSAPP
     ============================================================ */

  function buildWhatsAppMessage(data) {
    return [
      "🚚 BURSA HIZLI TESLİMAT",
      "",
      "📦 YENİ TESLİMAT TALEBİ",
      "",
      `🔢 Sipariş No: ${data.siparis_no}`,
      `👤 Ad Soyad: ${data.ad_soyad}`,
      `📞 Telefon: ${data.telefon}`,
      "",
      `📍 Alınacak Adres:`,
      data.alis_adresi,
      "",
      `🏁 Teslim Edilecek Adres:`,
      data.teslimat_adresi,
      "",
      `📦 Paket Türü: ${data.paket_tipi || "Belirtilmedi"}`,
      `⚡ Aciliyet: ${data.aciliyet || "Normal"}`,
      "",
      `📝 Açıklama: ${data.aciklama || "Yok"}`,
      `💬 Ek Not: ${data.notlar || "Yok"}`,
      "",
      "Lütfen teslimat talebini kontrol ediniz."
    ].join("\n");
  }

  function openWhatsApp(data) {
    const message = buildWhatsAppMessage(data);

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` +
      encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
  }

  /* ============================================================
     FORM MESAJI
     ============================================================ */

  function showFormMessage(message, type = "success") {
    const element = $("#formMessage");

    if (!element) {
      return;
    }

    element.textContent = message;
    element.classList.add("show");

    if (type === "error") {
      element.style.background = "rgba(255,98,98,.10)";
      element.style.borderColor = "rgba(255,98,98,.30)";
      element.style.color = "#ff9b9b";
    } else {
      element.style.background = "rgba(25,195,125,.10)";
      element.style.borderColor = "rgba(25,195,125,.30)";
      element.style.color = "#83f0be";
    }
  }

  /* ============================================================
     TESLİMAT FORMU
     ============================================================ */

  async function handleDeliverySubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const name = $("#name")?.value.trim() || "";
    const phoneRaw = $("#phone")?.value.trim() || "";
    const pickup = $("#pickup")?.value.trim() || "";
    const delivery = $("#delivery")?.value.trim() || "";
    const packageType = $("#packageType")?.value || "";
    const urgency = $("#urgency")?.value || "Normal";
    const description = $("#description")?.value.trim() || "";
    const note = $("#note")?.value.trim() || "";

    /* -----------------------------
       VALIDASYON
       ----------------------------- */

    if (name.length < 2) {
      showFormMessage(
        "Lütfen ad ve soyad bilgilerinizi girin.",
        "error"
      );
      $("#name")?.focus();
      return;
    }

    if (!isValidTurkishPhone(phoneRaw)) {
      showFormMessage(
        "Lütfen geçerli bir Türkiye cep telefonu numarası girin.",
        "error"
      );
      $("#phone")?.focus();
      return;
    }

    if (pickup.length < 5) {
      showFormMessage(
        "Lütfen alınacak adresi eksiksiz girin.",
        "error"
      );
      $("#pickup")?.focus();
      return;
    }

    if (delivery.length < 5) {
      showFormMessage(
        "Lütfen teslim edilecek adresi eksiksiz girin.",
        "error"
      );
      $("#delivery")?.focus();
      return;
    }

    const phone = formatTurkishPhone(phoneRaw);

    /* -----------------------------
       BUTON
       ----------------------------- */

    const submitButton = form.querySelector(
      'button[type="submit"]'
    );

    const originalButtonText = submitButton
      ? submitButton.innerHTML
      : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = "⏳ Talep Oluşturuluyor...";
      submitButton.style.opacity = "0.7";
      submitButton.style.pointerEvents = "none";
    }

    try {
      showFormMessage("Teslimat talebiniz kaydediliyor...");

      const client = await initSupabase();

      /* -----------------------------
         SİPARİŞ NUMARASI CLIENT'TA ÜRETİLİYOR
         ----------------------------- */

      const siparisNo = generateOrderNumber();

      const payload = {
        siparis_no: siparisNo,
        ad_soyad: name,
        telefon: phone,
        alis_adresi: pickup,
        teslimat_adresi: delivery,
        paket_tipi: packageType || null,
        aciliyet:
          urgency.toLowerCase() === "acil"
            ? "acil"
            : "normal",
        aciklama: description || null,
        notlar: note || null,
        durum: "bekliyor"
      };

      /* ========================================================
         ÇOK ÖNEMLİ DÜZELTME

         ESKİ:
         insert(...).select(...).single()

         YENİ:
         sadece INSERT

         Böylece anonim mobil kullanıcıdan SELECT yetkisi
         istemiyoruz.
         ======================================================== */

      const { error } = await client
        .from("teslimat_talepleri")
        .insert([payload]);

      if (error) {
        console.error("Teslimat kayıt hatası:", error);
        throw error;
      }

      /* -----------------------------
         BAŞARILI
         ----------------------------- */

      showFormMessage(
        `✅ Talebiniz oluşturuldu. Sipariş Numaranız: ${siparisNo}`
      );

      /* -----------------------------
         WHATSAPP
         ----------------------------- */

      openWhatsApp(payload);

      /* -----------------------------
         FORM TEMİZLE
         ----------------------------- */

      form.reset();

      /* -----------------------------
         BUTON
         ----------------------------- */

      if (submitButton) {
        submitButton.innerHTML = "✅ Talep Oluşturuldu";
      }

      setTimeout(() => {
        if (submitButton) {
          submitButton.innerHTML = originalButtonText;
          submitButton.disabled = false;
          submitButton.style.opacity = "";
          submitButton.style.pointerEvents = "";
        }
      }, 3500);

    } catch (error) {
      console.error(error);

      showFormMessage(
        "Teslimat talebi kaydedilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
        "error"
      );

      if (submitButton) {
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        submitButton.style.opacity = "";
        submitButton.style.pointerEvents = "";
      }
    }
  }

  /* ============================================================
     TELEFON ALANI FORMATLAMA
     ============================================================ */

  function setupPhoneFormatting() {
    const phoneInput = $("#phone");

    if (!phoneInput) {
      return;
    }

    phoneInput.addEventListener("input", () => {
      const cursorPosition = phoneInput.selectionStart;

      phoneInput.value = formatTurkishPhone(
        phoneInput.value
      );

      if (
        document.activeElement === phoneInput &&
        cursorPosition !== null
      ) {
        try {
          phoneInput.setSelectionRange(
            phoneInput.value.length,
            phoneInput.value.length
          );
        } catch (_) {}
      }
    });
  }

  /* ============================================================
     FORM
     ============================================================ */

  function setupDeliveryForm() {
    const form = $("#deliveryForm");

    if (!form) {
      return;
    }

    form.addEventListener(
      "submit",
      handleDeliverySubmit
    );
  }

  /* ============================================================
     WHATSAPP / TELEFON LINKLERİ
     ============================================================ */

  function setupContactLinks() {
    document.querySelectorAll('a[href^="tel:"]').forEach(
      (link) => {
        link.addEventListener("click", () => {
          console.log(
            "Telefon aranıyor:",
            BUSINESS_PHONE
          );
        });
      }
    );
  }

  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */

  function setupSmoothScroll() {
    document
      .querySelectorAll('a[href^="#"]')
      .forEach((link) => {
        link.addEventListener("click", (event) => {
          const targetId =
            link.getAttribute("href");

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
        });
      });
  }

  /* ============================================================
     HEADER SCROLL
     ============================================================ */

  function setupHeader() {
    const header =
      document.querySelector(".site-header");

    if (!header) {
      return;
    }

    const updateHeader = () => {
      if (window.scrollY > 20) {
        header.style.boxShadow =
          "0 10px 35px rgba(0,0,0,.22)";
      } else {
        header.style.boxShadow = "";
      }
    };

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );

    updateHeader();
  }

  /* ============================================================
     BASİT REVEAL ANİMASYONU
     ============================================================ */

  function setupReveal() {
    const elements = document.querySelectorAll(
      ".step-card, .service-card, .contact-card, .quick-item, .hero-card"
    );

    if (!elements.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.style.opacity = "1";
            entry.target.style.transform =
              "translateY(0)";

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.08
        }
      );

    elements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform =
        "translateY(16px)";
      element.style.transition =
        "opacity .55s ease, transform .55s ease";

      observer.observe(element);
    });
  }

  /* ============================================================
     BAŞLAT
     ============================================================ */

  function init() {
    setupDeliveryForm();
    setupPhoneFormatting();
    setupContactLinks();
    setupSmoothScroll();
    setupHeader();
    setupReveal();

    console.log(
      "🚚 Bursa Hızlı Teslimat sistemi hazır."
    );
  }

  /* ============================================================
     GLOBAL API
     ============================================================ */

  window.BursaHizliTeslimat = {
    buildWhatsAppMessage,
    isValidTurkishPhone,
    formatTurkishPhone,
    generateOrderNumber,
    getSupabase: () => supabase,
    openWhatsApp
  };

  /* ============================================================
     DOM READY
     ============================================================ */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
