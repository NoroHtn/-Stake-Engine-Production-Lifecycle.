(() => {
  "use strict";

  const SUPPORTED_LANGUAGES = ["en", "hy", "ru"];
  const SUPPORTED_THEMES = ["dark", "light"];
  const STORAGE_KEYS = {
    language: "stakeGuideLanguage",
    theme: "stakeGuideTheme",
  };

  const labels = {
    en: {
      print: "Print / Save PDF",
      skip: "Skip to main content",
      phases: "The 9 phases",
      specialist: "Specialist reference",
      theme: "Theme",
      dark: "Dark theme",
      light: "Light theme",
    },
    hy: {
      print: "Տպել / Պահել PDF",
      skip: "Անցնել հիմնական բովանդակությանը",
      phases: "9 փուլերը",
      specialist: "Մասնագիտական տեղեկատու",
      theme: "Թեմա",
      dark: "Մուգ թեմա",
      light: "Բաց թեմա",
    },
    ru: {
      print: "Печать / PDF",
      skip: "К основному содержанию",
      phases: "9 этапов",
      specialist: "Справочник для специалистов",
      theme: "Тема",
      dark: "Тёмная тема",
      light: "Светлая тема",
    },
  };

  const brands = {
    en: "Stake Engine Working Guide · Team Edition",
    hy: "Stake Engine-ի աշխատանքային ուղեցույց · Թիմային տարբերակ",
    ru: "Рабочее руководство Stake Engine · Командная версия",
  };

  const phaseLabels = {
    en: [
      "Publisher & Project Ready",
      "Concept & Stake Fit",
      "Math Prototype & Event Contract",
      "Visual Direction & UX Architecture",
      "Production Sprint · Four Parallel Lanes",
      "RGS Integration & Mandatory Replay",
      "Internal QA & Release Candidate",
      "Publish, Submit & Review Loop",
      "Go Live & Operate",
    ],
    hy: [
      "Հրատարակիչը և նախագիծը պատրաստ են",
      "Գաղափար և համապատասխանություն Stake-ին",
      "Մաթեմատիկական նախատիպ և իրադարձությունների պայմանագիր",
      "Տեսողական ուղղություն և UX ճարտարապետություն",
      "Արտադրական սպրինտ · Չորս զուգահեռ ուղղություն",
      "RGS ինտեգրում և պարտադիր վերարտադրում",
      "Ներքին QA և թողարկման թեկնածու",
      "Հրապարակում, ներկայացում և ստուգման ցիկլ",
      "Գործարկում և շահագործում",
    ],
    ru: [
      "Готовность издателя и проекта",
      "Концепция и соответствие Stake",
      "Прототип математики и контракт событий",
      "Визуальное направление и архитектура UX",
      "Производственный спринт · Четыре параллельных направления",
      "Интеграция с RGS и обязательный повтор",
      "Внутреннее QA и релизный кандидат",
      "Публикация, подача и цикл проверки",
      "Запуск и эксплуатация",
    ],
  };

  const readPreference = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
      );
      return match ? decodeURIComponent(match[1]) : null;
    }
  };

  const savePreference = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  };

  const setTheme = (theme, save = true) => {
    const nextTheme = SUPPORTED_THEMES.includes(theme) ? theme : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.body.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;

    document.querySelectorAll("[data-theme-button]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themeButton === nextTheme)
      );
    });

    if (save) savePreference(STORAGE_KEYS.theme, nextTheme);
  };

  const setLanguage = (language, save = true) => {
    const nextLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : "en";
    const copy = labels[nextLanguage];

    document.querySelectorAll(".language").forEach((section) => {
      const active = section.dataset.lang === nextLanguage;
      section.classList.toggle("active", active);
      section.hidden = !active;
      section.setAttribute("aria-hidden", String(!active));
    });

    document.querySelectorAll("[data-lang-button]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.langButton === nextLanguage)
      );
    });

    document.documentElement.lang = nextLanguage;
    document.body.dataset.language = nextLanguage;

    const brand = document.getElementById("brandName");
    const skip = document.querySelector(".skip");
    const themeGroup = document.querySelector(".seg.theme");
    const darkButton = document.querySelector('[data-theme-button="dark"]');
    const lightButton = document.querySelector('[data-theme-button="light"]');
    const printButton = document.getElementById("printButton");
    const printLabel = printButton?.querySelector("span");

    if (brand) brand.textContent = brands[nextLanguage];
    if (skip) skip.textContent = copy.skip;
    if (themeGroup) themeGroup.setAttribute("aria-label", copy.theme);
    if (darkButton) darkButton.setAttribute("aria-label", copy.dark);
    if (lightButton) lightButton.setAttribute("aria-label", copy.light);
    if (printLabel) printLabel.textContent = copy.print;
    if (printButton) printButton.setAttribute("aria-label", copy.print);

    document.querySelectorAll(".rail a[data-phase-link]").forEach((anchor) => {
      const phase = anchor.dataset.phaseLink;
      const specialist = phase === "S";
      const target = specialist
        ? `#specialist-${nextLanguage}`
        : `#phase-${phase}-${nextLanguage}`;
      anchor.href = target;
      anchor.setAttribute(
        "aria-label",
        specialist
          ? copy.specialist
          : `${copy.phases} · ${phase}: ${phaseLabels[nextLanguage][Number(phase)]}`
      );
    });

    if (save) {
      const currentHash = window.location.hash.slice(1);
      const translatedHash = currentHash.replace(
        /-(en|hy|ru)$/,
        `-${nextLanguage}`
      );

      if (
        currentHash &&
        translatedHash !== currentHash &&
        document.getElementById(translatedHash)
      ) {
        try {
          window.history.replaceState(null, "", `#${translatedHash}`);
        } catch {
          window.location.hash = translatedHash;
        }
      }

      savePreference(STORAGE_KEYS.language, nextLanguage);
    }
  };

  const toggleSpecialistDetails = (button) => {
    const root = button.closest(".specialist");
    if (!root) return;

    const details = Array.from(root.querySelectorAll("details"));
    const shouldOpen = details.some((detail) => !detail.open);
    details.forEach((detail) => {
      detail.open = shouldOpen;
    });

    const language = SUPPORTED_LANGUAGES.includes(button.dataset.langTarget)
      ? button.dataset.langTarget
      : "en";
    const openLabels = {
      en: "Open specialist modules",
      hy: "Բացել մասնագիտական բաժինները",
      ru: "Открыть модули специалистов",
    };
    const closeLabels = {
      en: "Close specialist modules",
      hy: "Փակել մասնագիտական բաժինները",
      ru: "Закрыть модули специалистов",
    };
    button.textContent = shouldOpen
      ? closeLabels[language]
      : openLabels[language];
  };

  const initializeObservers = () => {
    if (!("IntersectionObserver" in window)) return;

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.06 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((element) =>
      reveal.observe(element)
    );
    document.documentElement.classList.add("reveal-ready");

    const progress = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const phase = entry.target.dataset.phase;
          document
            .querySelectorAll(
              ".rail a[data-phase-link], .language.active [data-jump-phase]"
            )
            .forEach((anchor) => {
              const active =
                (anchor.dataset.phaseLink || anchor.dataset.jumpPhase) === phase;
              anchor.classList.toggle("active", active);
              if (active) anchor.setAttribute("aria-current", "step");
              else anchor.removeAttribute("aria-current");
            });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    document.querySelectorAll(".phase").forEach((element) =>
      progress.observe(element)
    );
  };

  const initialize = () => {
    const hashLanguage = window.location.hash.match(/-(en|hy|ru)$/)?.[1];
    const savedLanguage = readPreference(STORAGE_KEYS.language);
    const savedTheme = readPreference(STORAGE_KEYS.theme);

    setLanguage(hashLanguage || savedLanguage || "en", false);
    setTheme(savedTheme || "dark", false);

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const languageButton = target?.closest("[data-lang-button]");
      const themeButton = target?.closest("[data-theme-button]");
      const detailsButton = target?.closest(".details-toggle");
      const printButton = target?.closest("#printButton");

      if (languageButton) {
        event.preventDefault();
        setLanguage(languageButton.dataset.langButton);
      } else if (themeButton) {
        event.preventDefault();
        setTheme(themeButton.dataset.themeButton);
      } else if (detailsButton) {
        event.preventDefault();
        toggleSpecialistDetails(detailsButton);
      } else if (printButton) {
        event.preventDefault();
        window.print();
      }
    });

    initializeObservers();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
