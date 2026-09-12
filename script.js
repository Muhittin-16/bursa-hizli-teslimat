/* ============================================================
   BURSA HIZLI TESLİMAT
   script.js
   Gerçek Supabase teslimat sistemi + WhatsApp + kullanıcı işlemleri
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     SUPABASE AYARLARI
     ============================================================ */

  const SUPABASE_URL =
    "https://cwfkrwfvxurmtjkvllul.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Kg3VNlkTYcjRDctC5RHPxA_eaX7YkCA";

  const WHATSAPP_NUMBER = "905539497449";
  const BUSINESS_PHONE = "05539497449";

  let supabase = null;

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

  /* ============================================================
     SUPABASE BAĞLANTISI
     ============================================================ */

  async function initSupabase() {
    try {
      const module = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );

      if (!module || !module.createClient) {
        throw new Error(
          "Supabase kütüphanesi yüklenemedi."
        );
      }

      supabase = module.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );

      console.log(
        "✅ Supabase bağlantısı hazır."
      );

      return true;

    } catch (error) {
      console.error(
        "❌ Supabase bağlantı hatası:",
        error
      );

      return false;
    }
  }

  /* ============================================================
     SAYFA YÜKLENDİĞİNDE
     ============================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

      await initSupabase();

      initSmoothScroll();
      initDeliveryForm();
      initPhoneFormatting();
      initHeaderScroll();
      initRevealAnimations();
      initContactLinks();
    }
  );

  /* ============================================================
     YUMUŞAK KAYDIRMA
     ============================================================ */

  function initSmoothScroll() {

    const links = $$(
      'a[href^="#"]'
    );

    links.forEach((link) => {

      link.addEventListener(
        "click",
        (event) => {

          const targetId =
            link.getAttribute("href");

          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }

          const target =
            document.querySelector(
              targetId
            );

          if (!target) {
            return;
          }

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

          document.body.classList.remove(
            "menu-open"
          );
        }
      );
    });
  }

  /* ============================================================
     TESLİMAT FORMU
     ============================================================ */

  function initDeliveryForm() {

    const form =
      $("#deliveryForm");

    if (!form) {
      return;
    }

    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        clearFormMessage();

        /* ------------------------------------------------------
           SUPABASE HAZIR MI?
           ------------------------------------------------------ */

        if (!supabase) {

          showFormMessage(
            "Sistem bağlantısı hazırlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.",
            "error"
          );

          return;
        }

        /* ------------------------------------------------------
           FORM VERİLERİ
           ------------------------------------------------------ */

        const name =
          clean($("#name")?.value);

        const phone =
          clean($("#phone")?.value);

        const pickup =
          clean($("#pickup")?.value);

        const delivery =
          clean($("#delivery")?.value);

        const packageType =
          clean($("#packageType")?.value);

        const urgency =
          clean($("#urgency")?.value) ||
          "Normal";

        const description =
          clean($("#description")?.value);

        const note =
          clean($("#note")?.value);

        /* ------------------------------------------------------
           ZORUNLU ALAN KONTROLLERİ
           ------------------------------------------------------ */

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

        /* ------------------------------------------------------
           BUTONU KİLİTLE
           ------------------------------------------------------ */

        const submitButton =
          form.querySelector(
            'button[type="submit"], input[type="submit"]'
          );

        const originalButtonText =
          submitButton
            ? submitButton.innerHTML
            : "";

        if (submitButton) {

          submitButton.disabled = true;

          submitButton.innerHTML =
            "⏳ Talep oluşturuluyor...";
        }

        showFormMessage(
          "Teslimat talebiniz sisteme kaydediliyor...",
          "success"
        );

        try {

          /* ----------------------------------------------------
             TELEFONU TEMİZLE
             ---------------------------------------------------- */

          const cleanPhone =
            phone.replace(
              /\D/g,
              ""
            );

          /* ----------------------------------------------------
             SUPABASE'E GERÇEK KAYIT
             ---------------------------------------------------- */

          const {
            data,
            error
          } = await supabase
            .from("teslimat_talepleri")
            .insert([
              {
                ad_soyad: name,

                telefon: cleanPhone,

                alis_adresi: pickup,

                teslimat_adresi: delivery,

                paket_tipi:
                  packageType || null,

                aciliyet:
                  urgency || "Normal",

                aciklama:
                  description || null,

                notlar:
                  note || null,

                durum:
                  "bekliyor"
              }
            ])
            .select(
              "id, siparis_no, created_at"
            )
            .single();

          /* ----------------------------------------------------
             SUPABASE HATASI
             ---------------------------------------------------- */

          if (error) {

            console.error(
              "Supabase kayıt hatası:",
              error
            );

            showFormMessage(
              "Teslimat talebi kaydedilemedi. Lütfen tekrar deneyin.",
              "error"
            );

            return;
          }

          /* ----------------------------------------------------
             SİPARİŞ NUMARASI
             ---------------------------------------------------- */

          const orderNumber =
            data?.siparis_no ||
            "BHT-" +
              String(
                data?.id || ""
              ).substring(0, 8);

          /* ----------------------------------------------------
             WHATSAPP MESAJI
             ---------------------------------------------------- */

          const message =
            buildWhatsAppMessage({
              name,
              phone,
              pickup,
              delivery,
              packageType,
              urgency,
              description,
              note,
              orderNumber
            });

          const whatsappUrl =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              message
            )}`;

          /* ----------------------------------------------------
             BAŞARILI MESAJ
             ---------------------------------------------------- */

          showFormMessage(
            `✅ Talebiniz başarıyla oluşturuldu. Sipariş Numaranız: ${orderNumber}`,
            "success"
          );

          /* ----------------------------------------------------
             FORMU TEMİZLE
             ---------------------------------------------------- */

          form.reset();

          /* ----------------------------------------------------
             WHATSAPP'I AÇ
             ---------------------------------------------------- */

          setTimeout(() => {

            try {

              window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
              );

            } catch (whatsappError) {

              console.warn(
                "WhatsApp açılamadı:",
                whatsappError
              );
            }

          }, 500);

        } catch (error) {

          console.error(
            "Beklenmeyen teslimat hatası:",
            error
          );

          showFormMessage(
            "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
            "error"
          );

        } finally {

          /* ----------------------------------------------------
             BUTONU TEKRAR AKTİFLEŞTİR
             ---------------------------------------------------- */

          if (submitButton) {

            submitButton.disabled = false;

            submitButton.innerHTML =
              originalButtonText ||
              "🚀 Teslimat Talebi Oluştur";
          }
        }
      }
    );
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
      note,
      orderNumber
    } = data;

    let message = "";

    message +=
      "🏍️ BURSA HIZLI TESLİMAT\n";

    message +=
      "📦 YENİ TESLİMAT TALEBİ\n";

    message +=
      "━━━━━━━━━━━━━━━━━━━━\n\n";

    if (orderNumber) {

      message +=
        `🔖 Sipariş No: ${orderNumber}\n\n`;
    }

    message +=
      `👤 Ad Soyad: ${name}\n`;

    message +=
      `📞 Telefon: ${phone}\n\n`;

    message +=
      "📍 ALINACAK ADRES\n";

    message +=
      `${pickup}\n\n`;

    message +=
      "🏁 TESLİM EDİLECEK ADRES\n";

    message +=
      `${delivery}\n\n`;

    message +=
      "📦 PAKET BİLGİLERİ\n";

    if (packageType) {

      message +=
        `Paket Türü: ${packageType}\n`;

    } else {

      message +=
        "Paket Türü: Belirtilmedi\n";
    }

    message +=
      `⚡ Aciliyet: ${urgency}\n`;

    if (description) {

      message +=
        `📝 Açıklama: ${description}\n`;
    }

    if (note) {

      message +=
        `💬 Ek Not: ${note}\n`;
    }

    message += "\n";

    message +=
      "━━━━━━━━━━━━━━━━━━━━\n";

    message +=
      "Bu talep Bursa Hızlı Teslimat web sitesinden oluşturulmuştur.";

    return message;
  }

  /* ============================================================
     TELEFON NUMARASI FORMATLAMA
     ============================================================ */

  function initPhoneFormatting() {

    const phoneInput =
      $("#phone");

    if (!phoneInput) {
      return;
    }

    phoneInput.addEventListener(
      "input",
      () => {

        let value =
          phoneInput.value;

        value =
          value.replace(
            /\D/g,
            ""
          );

        if (
          value.startsWith("90") &&
          value.length > 10
        ) {

          value =
            "0" +
            value.substring(2);
        }

        if (
          value.length === 10 &&
          !value.startsWith("0")
        ) {

          value =
            "0" +
            value;
        }

        value =
          value.substring(0, 11);

        phoneInput.value =
          formatTurkishPhone(
            value
          );
      }
    );
  }

  /* ============================================================
     TELEFON FORMAT
     ============================================================ */

  function formatTurkishPhone(value) {

    const digits =
      String(value || "")
        .replace(/\D/g, "");

    if (digits.length <= 4) {
      return digits;
    }

    if (digits.length <= 7) {

      return (
        `${digits.substring(0, 4)} ` +
        `${digits.substring(4)}`
      );
    }

    if (digits.length <= 9) {

      return (
        `${digits.substring(0, 4)} ` +
        `${digits.substring(4, 7)} ` +
        `${digits.substring(7)}`
      );
    }

    return (
      `${digits.substring(0, 4)} ` +
      `${digits.substring(4, 7)} ` +
      `${digits.substring(7, 9)} ` +
      `${digits.substring(9, 11)}`
    );
  }

  /* ============================================================
     TELEFON DOĞRULAMA
     ============================================================ */

  function isValidTurkishPhone(phone) {

    const digits =
      String(phone || "")
        .replace(/\D/g, "");

    return /^05\d{9}$/.test(
      digits
    );
  }

  /* ============================================================
     FORM MESAJLARI
     ============================================================ */

  function showFormMessage(
    message,
    type = "success"
  ) {

    const box =
      $("#formMessage");

    if (!box) {
      return;
    }

    box.textContent =
      message;

    box.classList.remove(
      "success",
      "error",
      "show"
    );

    box.classList.add(
      type
    );

    requestAnimationFrame(() => {

      box.classList.add(
        "show"
      );
    });
  }

  function clearFormMessage() {

    const box =
      $("#formMessage");

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

  function focusField(
    selector
  ) {

    const field =
      $(selector);

    if (!field) {
      return;
    }

    field.focus();

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

    const header =
      $(".site-header");

    if (!header) {
      return;
    }

    const updateHeader =
      () => {

        if (
          window.scrollY > 20
        ) {

          header.classList.add(
            "scrolled"
          );

        } else {

          header.classList.remove(
            "scrolled"
          );
        }
      };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true
      }
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

    if (
      !(
        "IntersectionObserver"
        in window
      )
    ) {

      elements.forEach(
        (element) => {

          element.classList.add(
            "visible"
          );
        }
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries, obs) => {

          entries.forEach(
            (entry) => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "visible"
              );

              obs.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.12
        }
      );

    elements.forEach(
      (element) => {

        observer.observe(
          element
        );
      }
    );
  }

  /* ============================================================
     TELEFON / WHATSAPP LİNKLERİ
     ============================================================ */

  function initContactLinks() {

    const whatsappLinks =
      $$(
        'a[href*="wa.me"]'
      );

    whatsappLinks.forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {}
        );
      }
    );

    const phoneLinks =
      $$(
        'a[href^="tel:"]'
      );

    phoneLinks.forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {}
        );
      }
    );
  }

  /* ============================================================
     GLOBAL FONKSİYONLAR
     ============================================================ */

  window.BursaHizliTeslimat = {

    buildWhatsAppMessage,

    isValidTurkishPhone,

    formatTurkishPhone,

    getSupabase: () => supabase
  };

})();
