/* =========================================================
   BURSA HIZLI TESLİMAT
   script.js
   Ön yüz form işlemleri
   ========================================================= */

(() => {
    "use strict";

    // ---------------------------------------------------------
    // FORM ELEMANLARI
    // ---------------------------------------------------------

    const deliveryForm = document.getElementById("deliveryForm");
    const formMessage = document.getElementById("formMessage");

    // Form sayfada yoksa kodu çalıştırmadan çık
    if (!deliveryForm) {
        return;
    }

    // ---------------------------------------------------------
    // YARDIMCI FONKSİYONLAR
    // ---------------------------------------------------------

    function generateOrderNumber() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        const randomNumber = Math.floor(1000 + Math.random() * 9000);

        return `BHT-${year}${month}${day}-${randomNumber}`;
    }

    function getFormData() {
        return {
            id: generateOrderNumber(),

            name: document.getElementById("name")?.value.trim() || "",

            phone: document.getElementById("phone")?.value.trim() || "",

            pickup: document.getElementById("pickup")?.value.trim() || "",

            delivery: document.getElementById("delivery")?.value.trim() || "",

            packageType: document.getElementById("packageType")?.value || "",

            urgency: document.getElementById("urgency")?.value || "",

            description:
                document.getElementById("description")?.value.trim() || "",

            note:
                document.getElementById("note")?.value.trim() || "",

            status: "Yeni",

            createdAt: new Date().toISOString()
        };
    }

    function saveRequest(request) {
        const storageKey = "bursaHizliTeslimatTalepleri";

        let requests = [];

        try {
            const saved = localStorage.getItem(storageKey);

            if (saved) {
                requests = JSON.parse(saved);

                if (!Array.isArray(requests)) {
                    requests = [];
                }
            }
        } catch (error) {
            requests = [];
        }

        requests.push(request);

        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(requests)
            );
        } catch (error) {
            console.warn(
                "Talep tarayıcı hafızasına kaydedilemedi.",
                error
            );
        }
    }

    function showMessage(message, type = "success") {
        if (!formMessage) {
            return;
        }

        formMessage.textContent = message;

        formMessage.classList.remove(
            "success",
            "error"
        );

        formMessage.classList.add(type);

        formMessage.style.display = "block";
    }

    function hideMessage() {
        if (!formMessage) {
            return;
        }

        formMessage.textContent = "";
        formMessage.style.display = "none";

        formMessage.classList.remove(
            "success",
            "error"
        );
    }

    // ---------------------------------------------------------
    // TELEFON NUMARASI KONTROLÜ
    // ---------------------------------------------------------

    const phoneInput = document.getElementById("phone");

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            let value = phoneInput.value;

            // Rakam dışındaki karakterleri temizle
            value = value.replace(/\D/g, "");

            // Türkiye başındaki 0 olmadan girilmişse
            // kullanıcıya kolaylık sağlamak için 0 ekleme
            if (value.length > 0 && value.charAt(0) !== "0") {
                value = "0" + value;
            }

            // En fazla 11 rakam
            value = value.substring(0, 11);

            phoneInput.value = value;
        });
    }

    // ---------------------------------------------------------
    // FORM GÖNDERME
    // ---------------------------------------------------------

    deliveryForm.addEventListener("submit", (event) => {
        event.preventDefault();

        hideMessage();

        const request = getFormData();

        // -----------------------------------------------------
        // ZORUNLU ALAN KONTROLLERİ
        // -----------------------------------------------------

        if (!request.name) {
            showMessage(
                "Lütfen adınızı ve soyadınızı yazın.",
                "error"
            );
            document.getElementById("name")?.focus();
            return;
        }

        if (!request.phone) {
            showMessage(
                "Lütfen telefon numaranızı yazın.",
                "error"
            );
            document.getElementById("phone")?.focus();
            return;
        }

        if (request.phone.length < 10) {
            showMessage(
                "Lütfen geçerli bir telefon numarası girin.",
                "error"
            );
            document.getElementById("phone")?.focus();
            return;
        }

        if (!request.pickup) {
            showMessage(
                "Lütfen alınacak adresi yazın.",
                "error"
            );
            document.getElementById("pickup")?.focus();
            return;
        }

        if (!request.delivery) {
            showMessage(
                "Lütfen teslim edilecek adresi yazın.",
                "error"
            );
            document.getElementById("delivery")?.focus();
            return;
        }

        // -----------------------------------------------------
        // TALEBİ KAYDET
        // -----------------------------------------------------

        saveRequest(request);

        // -----------------------------------------------------
        // BAŞARI MESAJI
        // -----------------------------------------------------

        showMessage(
            `Talebiniz başarıyla alındı! Talep numaranız: ${request.id}. En kısa sürede sizinle iletişime geçeceğiz.`,
            "success"
        );

        // Formu temizle
        deliveryForm.reset();

        // Başarı mesajına doğru kaydır
        if (formMessage) {
            setTimeout(() => {
                formMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 100);
        }
    });

    // ---------------------------------------------------------
    // SAYFA İÇİ MENÜLER
    // ---------------------------------------------------------

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
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
        });
    });

    // ---------------------------------------------------------
    // SAYFA YÜKLENDİ
    // ---------------------------------------------------------

    console.log(
        "Bursa Hızlı Teslimat sistemi hazır."
    );

})();
