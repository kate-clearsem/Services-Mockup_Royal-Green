const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

document.querySelectorAll("[data-estimate-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    if (status) {
      status.textContent = "Thank you. This website mockup is not connected to a submission service yet. Please call our office to complete your request.";
      status.classList.add("is-visible");
      status.setAttribute("role", "status");
    }
    form.reset();
  });
});

document.querySelectorAll("[data-careers-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    if (status) {
      status.textContent = "Your application was not sent. The site needs a secure application submission service before it can receive your information or resume.";
      status.classList.add("is-visible");
      status.setAttribute("role", "status");
    }
  });
});

const tabButtons = document.querySelectorAll("[data-tab-target]");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.tabTarget;
    const tabList = button.closest('[role="tablist"]');
    const panelContainer = tabList?.parentElement;
    if (!targetId || !panelContainer) return;

    tabList.querySelectorAll("[data-tab-target]").forEach((tab) => {
      const selected = tab === button;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panelContainer.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.hidden = panel.id !== targetId;
    });
  });
});

const activateEstimateTabFromHash = () => {
  if (window.location.hash === "#estimate") {
    document.querySelector('[data-tab-target="panel-estimate"]')?.click();
  }
};

activateEstimateTabFromHash();
window.addEventListener("hashchange", activateEstimateTabFromHash);

const filterButtons = document.querySelectorAll("[data-filter]");
const categoryLabels = {
  "lawn-turf-pests": "Lawn & Turf Pests",
  "lawn-plant-diseases": "Lawn & Plant Diseases",
  "tree-shrub-pests": "Tree, Shrub & Ornamental Pests",
  "indoor-pests": "Indoor Pests",
  "outdoor-perimeter-pests": "Outdoor & Perimeter Pests",
  "mosquitoes-biting-pests": "Mosquitoes & Biting Pests"
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".gallery-card").forEach((card) => {
      const categories = (card.dataset.categories || "").split("|");
      card.hidden = filter !== "all" && !categories.includes(filter);
    });
    filterButtons.forEach((filterButton) => {
      filterButton.setAttribute("aria-pressed", String(filterButton === button));
    });
  });
});

const requestedFilter = new URLSearchParams(window.location.search).get("filter");
if (requestedFilter) {
  Array.from(filterButtons).find((button) => button.dataset.filter === requestedFilter)?.click();
}

const modal = document.querySelector(".modal");
if (modal) {
  const modalTitle = modal.querySelector("[data-modal-title]");
  const modalText = modal.querySelector("[data-modal-description]");
  const modalImage = modal.querySelector("[data-modal-image]");
  const modalTags = modal.querySelector("[data-modal-tags]");
  const modalGalleryLink = modal.querySelector("[data-modal-gallery-link]");
  let modalTrigger = null;

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    modalTrigger?.focus();
  };

  const openModal = (card, homepageCard = false) => {
    const image = card.querySelector("img");
    const title = card.dataset.title || card.querySelector("h3")?.textContent || "";
    modalTrigger = homepageCard ? card : card.querySelector("[data-pest-open]");
    modalTitle.textContent = title;
    modalText.textContent = card.dataset.description || card.querySelector("p")?.textContent || "";
    modalImage.src = image?.src || "";
    modalImage.alt = image?.alt || "";
    modalTags.innerHTML = "";

    (card.dataset.categories || "").split("|").filter(Boolean).forEach((category) => {
      const filterButton = Array.from(filterButtons).find((candidate) => candidate.dataset.filter === category);
      const label = filterButton?.textContent.trim() || categoryLabels[category];
      if (!label) return;

      const tag = document.createElement(homepageCard ? "a" : "button");
      if (homepageCard) {
        tag.href = `pest-disease.html?filter=${encodeURIComponent(category)}`;
      } else {
        tag.type = "button";
      }
      tag.className = homepageCard ? "tag tag-link" : "tag tag-button";
      tag.dataset.filter = category;
      tag.textContent = label;
      tag.setAttribute("aria-label", `View ${tag.textContent} in the Pest and Disease Gallery`);
      if (!homepageCard) {
        tag.addEventListener("click", () => {
          filterButton.click();
          closeModal();
          filterButton.focus();
        });
      }
      modalTags.append(tag);
    });

    if (modalGalleryLink) {
      modalGalleryLink.hidden = !homepageCard;
      modalGalleryLink.href = `pest-disease.html?pest=${encodeURIComponent(title)}`;
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();
  };

  document.querySelectorAll("[data-pest-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".gallery-card");
      if (!card) return;
      openModal(card);
    });
  });

  document.querySelectorAll(".pest-card[data-title]").forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(card, true);
    });
  });

  const requestedPest = new URLSearchParams(window.location.search).get("pest");
  if (requestedPest) {
    const targetCard = Array.from(document.querySelectorAll(".gallery-card"))
      .find((card) => card.dataset.title?.toLocaleLowerCase() === requestedPest.toLocaleLowerCase());
    const openButton = targetCard?.querySelector("[data-pest-open]");
    if (targetCard && openButton) {
      targetCard.scrollIntoView({ block: "center" });
      openButton.click();
    }
  }

  modal.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
}

const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  }, { passive: true });
}
