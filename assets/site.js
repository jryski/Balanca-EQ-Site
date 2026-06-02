// BalanceEQ — shared site script (multipage). Plain vanilla JS, no dependencies.

// ---- Mobile nav ----
function toggleMobileMenu() {
  document.getElementById("navLinks").classList.toggle("active");
  document
    .querySelector(".mobile-menu-toggle")
    .classList.toggle("is-open");
}

function closeMobileMenu() {
  document.getElementById("navLinks").classList.remove("active");
  document
    .querySelector(".mobile-menu-toggle")
    .classList.remove("is-open");
}

// ---- Learn articles (learn page) ----
function showArticle(slug) {
  var index = document.getElementById("learn-index");
  var articles = document.querySelectorAll(".learn-article");
  if (slug === "index") {
    index.style.display = "block";
    articles.forEach(function (a) {
      a.style.display = "none";
    });
  } else {
    index.style.display = "none";
    articles.forEach(function (a) {
      a.style.display = "none";
    });
    var target = document.getElementById("article-" + slug);
    if (target) target.style.display = "block";
  }
  window.scrollTo(0, 0);
}

// ---- Evidence filtering (evidence page) ----
function filterEvidence(filter) {
  var cards = document.querySelectorAll(".evidence-card");
  cards.forEach(function (card) {
    if (filter === "all") {
      card.classList.remove("hidden");
    } else {
      var productType = card.getAttribute("data-product");
      card.classList.toggle("hidden", productType !== filter);
    }
  });

  // Toggle active state on filter buttons
  document.querySelectorAll("[data-filter]").forEach(function (btn) {
    btn.classList.remove(
      "btn-all-active",
      "btn-focus-active",
      "btn-restore-active",
    );
  });
  var activeBtn = document.querySelector(
    '[data-filter="' + filter + '"]',
  );
  if (filter === "all") activeBtn.classList.add("btn-all-active");
  else if (filter === "focus")
    activeBtn.classList.add("btn-focus-active");
  else if (filter === "restore")
    activeBtn.classList.add("btn-restore-active");
}

// ---- Science page (data-driven from balanceeq-content.json) ----
var scienceData = null;
var scienceLoaded = false;
var scienceCurrentProduct = "focus";

// Load data when Science page is first shown
function initScience() {
  if (scienceLoaded) return;
  scienceLoaded = true;
  fetch("../balanceeq-content.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (json) {
      scienceData = json;
      renderScienceOverview("focus");
      renderScienceOverview("restore");
    })
    .catch(function () {
      document.getElementById("science-overview-focus").innerHTML =
        '<p style="text-align:center;padding:2rem;color:#999">Could not load science data.</p>';
    });
}

// Toggle between Focus and Restore
function scienceToggle(product) {
  scienceCurrentProduct = product;
  document
    .querySelectorAll(".science-product")
    .forEach(function (el) {
      el.classList.remove("active");
    });
  document
    .getElementById("science-overview-" + product)
    .classList.add("active");

  // Update toggle buttons
  var focusBtn = document.getElementById("science-btn-focus");
  var restoreBtn = document.getElementById("science-btn-restore");
  focusBtn.className =
    "science-toggle__btn" +
    (product === "focus"
      ? " science-toggle__btn--active-focus"
      : "");
  restoreBtn.className =
    "science-toggle__btn" +
    (product === "restore"
      ? " science-toggle__btn--active-restore"
      : "");
}

// Show ingredient detail
function scienceShowDetail(ingredientId, product) {
  var ingredients = scienceData.ingredients[product];
  var ing = ingredients.find(function (i) {
    return i.id === ingredientId;
  });
  if (!ing) return;

  var isFocus = product === "focus";
  var supplierLinks = scienceData.supplier_links || {};
  var resolvedLink = ing.supplier_link
    ? supplierLinks[ing.supplier_link]
    : null;

  var html = "";

  // Back button
  html +=
    '<button class="science-back-btn" onclick="scienceHideDetail(\'' +
    product +
    "')\">&#8592; Back to " +
    (isFocus ? "EQ:Focus (AM)" : "EQ:Restore (PM)") +
    "</button>";

  // Badge + title
  html +=
    '<span class="science-badge science-badge--' +
    product +
    '">' +
    (isFocus ? "AM" : "PM") +
    " Formula</span>";
  html += '<h2 class="science-hero__name">' + ing.name;
  if (ing.branded) {
    html +=
      ' <span class="science-ingredient-branded">' +
      ing.branded +
      "</span>";
  }
  html += "</h2>";
  html += '<p class="science-hero__desc">' + ing.tagline + "</p>";

  // Meta grid
  html += '<div class="science-meta">';
  html +=
    '<div><div class="science-meta__label">Dose per serving</div><div class="science-meta__value">' +
    ing.dose +
    "</div></div>";
  html +=
    '<div><div class="science-meta__label">Form</div><div class="science-meta__value">' +
    ing.form +
    "</div></div>";
  html +=
    '<div><div class="science-meta__label">Category</div><div class="science-meta__value">' +
    ing.category +
    "</div></div>";
  html +=
    '<div><div class="science-meta__label">Supplier</div><div class="science-meta__value">' +
    (ing.supplier || "Generic (multi-source)") +
    "</div></div>";
  html += "</div>";

  // Prose sections
  html +=
    '<h3 class="science-section-title">Why It Is in ' +
    (isFocus ? "EQ:Focus" : "EQ:Restore") +
    "</h3>";
  html +=
    '<p class="science-body-text">' + ing.why_its_here + "</p>";
  html += '<h3 class="science-section-title">How It Works</h3>';
  html +=
    '<p class="science-body-text">' + ing.how_it_works + "</p>";
  html += '<h3 class="science-section-title">What to Expect</h3>';
  html +=
    '<p class="science-body-text">' + ing.what_to_expect + "</p>";

  // Studies
  if (ing.studies && ing.studies.length > 0) {
    html +=
      '<h3 class="science-section-title">Clinical Evidence</h3>';
    html +=
      '<p class="science-section-intro">Based on articles retrieved from PubMed, National Library of Medicine.</p>';
    ing.studies.forEach(function (s) {
      html += '<div class="science-study">';
      html +=
        '<div class="science-study__title">' + s.title + "</div>";
      html +=
        '<div class="science-study__meta">' +
        s.authors +
        " &middot; " +
        s.journal +
        " (" +
        s.year +
        ")</div>";
      html +=
        '<div class="science-study__summary">' +
        s.summary +
        "</div>";
      html +=
        '<div class="science-study__finding">' +
        s.key_finding +
        "</div>";
      html += '<div class="science-study__links">';
      html +=
        '<a href="https://doi.org/' +
        s.doi +
        '" target="_blank" rel="noopener noreferrer" class="science-study__link">DOI: ' +
        s.doi +
        " &#8599;</a>";
      if (s.pmid) {
        html +=
          '<a href="https://pubmed.ncbi.nlm.nih.gov/' +
          s.pmid +
          '/" target="_blank" rel="noopener noreferrer" class="science-study__link">PubMed: ' +
          s.pmid +
          " &#8599;</a>";
      }
      html += "</div>";
      html +=
        '<div class="science-study__attr">Study retrieved from PubMed / National Library of Medicine</div>';
      html += "</div>";
    });
  }

  // Supplier link
  if (resolvedLink && ing.supplier) {
    html +=
      '<h3 class="science-section-title">Supplier Transparency</h3>';
    html +=
      '<p class="science-section-intro">We source ' +
      (ing.branded || ing.name) +
      " directly from " +
      ing.supplier +
      ".</p>";
    html +=
      '<a href="' +
      resolvedLink +
      '" target="_blank" rel="noopener noreferrer" class="science-supplier-link">Visit ' +
      ing.supplier +
      " &#8599;</a>";
  }

  // Safety
  html += '<div class="science-callout">';
  html += "<strong>Safety Profile</strong><br>" + ing.safety_note;
  html += "</div>";

  // Disclaimer
  html +=
    '<div class="science-disclaimer">' +
    scienceData.brand.disclaimer +
    "</div>";

  // Insert and show
  document.getElementById("science-detail").innerHTML = html;
  document
    .querySelectorAll(".science-product")
    .forEach(function (el) {
      el.classList.remove("active");
    });
  document.getElementById("science-detail").classList.add("active");
  window.scrollTo(0, 0);
}

// Hide detail, return to overview
function scienceHideDetail(product) {
  document
    .querySelectorAll(".science-product")
    .forEach(function (el) {
      el.classList.remove("active");
    });
  document
    .getElementById("science-overview-" + product)
    .classList.add("active");
  window.scrollTo(0, 0);
}

// Build overview HTML for a product
function renderScienceOverview(product) {
  var pd = scienceData.products[product];
  var ings = scienceData.ingredients[product] || [];
  var isFocus = product === "focus";
  var html = "";

  // Hero
  html += '<div class="science-hero">';
  html +=
    '<span class="science-badge science-badge--' +
    product +
    '">' +
    pd.timing +
    " Formula</span>";
  html += '<h2 class="science-hero__name">' + pd.name + "</h2>";
  html += '<p class="science-hero__desc">' + pd.description + "</p>";
  html +=
    '<p class="science-hero__meta">Serving size: ' +
    pd.serving +
    "</p>";
  html +=
    '<p class="science-hero__meta"><strong>' +
    (pd.ingredient_count || ings.length) +
    " active ingredients</strong> &middot; " +
    ings.filter(function (i) {
      return i.studies && i.studies.length > 0;
    }).length +
    " with linked clinical studies</p>";
  html += "</div>";

  // Problem statement
  if (pd.problem_statement) {
    html +=
      '<h3 class="science-section-title">The Problem ' +
      pd.name +
      " Solves</h3>";
    html +=
      '<p class="science-body-text">' +
      pd.problem_statement +
      "</p>";
  }

  // Systems Framework (Focus only)
  if (isFocus && pd.systems_framework) {
    html +=
      '<h3 class="science-section-title">Four Systems, One Formula</h3>';
    html += '<div class="science-cards">';
    pd.systems_framework.forEach(function (s) {
      html += '<div class="brick">';
      html +=
        '<strong style="color:var(--raven)">' + s.name + "</strong>";
      html += '<p style="margin-top:0.5rem">' + s.summary + "</p>";
      html += "</div>";
    });
    html += "</div>";
  }

  // Transition Sequence (Restore only)
  if (!isFocus && pd.transition_sequence) {
    html +=
      '<h3 class="science-section-title">The Transition Sequence</h3>';
    html += '<ol class="science-steps">';
    pd.transition_sequence.forEach(function (s) {
      html += '<li class="science-step">';
      html +=
        '<div class="science-step__number">' + s.step + "</div>";
      html += '<div class="science-step__content">';
      html +=
        '<div class="science-step__title">' + s.title + "</div>";
      html +=
        '<div class="science-step__desc">' +
        s.description +
        "</div>";
      html += "</div></li>";
    });
    html += "</ol>";
  }

  // Caffeine FAQ (Focus only)
  if (isFocus && pd.caffeine_faq) {
    html +=
      '<h3 class="science-section-title">Does Focus Replace Caffeine?</h3>';
    html +=
      '<div class="science-callout">' + pd.caffeine_faq + "</div>";
  }

  // What Restore Is NOT
  if (!isFocus && pd.what_its_not) {
    html +=
      '<h3 class="science-section-title">What Restore Is NOT</h3>';
    html += '<div class="science-callout"><ul>';
    pd.what_its_not.forEach(function (item) {
      html += "<li>" + item + "</li>";
    });
    html += "</ul></div>";
  }

  // Who This Is For
  if (pd.personas) {
    html += '<h3 class="science-section-title">Who This Is For</h3>';
    html += '<div class="science-cards">';
    pd.personas.forEach(function (p) {
      html += '<div class="brick">';
      html += '<p style="color:var(--raven)">' + p + "</p>";
      html += "</div>";
    });
    html += "</div>";
  }

  var headingPrefix = pd.name.replace(":", " ") + ": ";

  // What to Expect
  if (pd.timeline) {
    html +=
      '<h3 class="science-section-title">' +
      headingPrefix +
      "What to Expect</h3>";
    html += '<div class="science-timeline">';
    pd.timeline.forEach(function (t) {
      html += '<div class="science-timeline__item">';
      html +=
        '<div class="science-timeline__period">' +
        t.period +
        "</div>";
      html +=
        '<div class="science-timeline__desc">' +
        t.description +
        "</div>";
      html += "</div>";
    });
    html += "</div>";
  }

  // Ingredients
  html +=
    '<h3 class="science-section-title">' +
    headingPrefix +
    "Ingredients</h3>";
  html +=
    '<p class="science-section-intro">Tap any ingredient for the full science deep-dive, clinical studies, and supplier information.</p>';
  html += '<div class="offset-alternate">';
  ings.forEach(function (ing) {
    html +=
      '<div class="offset-outer-wrapper" style="margin-bottom:1rem">';
    html +=
      '<div class="offset-inner-wrapper science-ingredient-row" onclick="scienceShowDetail(\'' +
      ing.id +
      "', '" +
      product +
      "')\">";
    html += "<div>";
    html +=
      '<div class="science-ingredient-name">' + ing.name + "</div>";
    if (ing.branded) {
      html +=
        '<div class="science-ingredient-branded">' +
        ing.branded +
        (ing.supplier ? " by " + ing.supplier : "") +
        "</div>";
    }
    html +=
      '<div class="science-ingredient-tagline">' +
      ing.tagline +
      "</div>";
    if (ing.studies && ing.studies.length > 0) {
      html +=
        '<div class="science-ingredient-studies">' +
        ing.studies.length +
        " clinical " +
        (ing.studies.length === 1 ? "study" : "studies") +
        " linked</div>";
    }
    html += "</div>";
    html +=
      '<div class="science-ingredient-dose">' + ing.dose + "</div>";
    html += "</div></div>";
  });
  html += "</div>";

  // Disclaimer
  html +=
    '<div class="science-disclaimer">' +
    scienceData.brand.disclaimer +
    "</div>";

  // System story (shown on both)
  var story = scienceData.brand.system_story;
  if (story) {
    html += '<div class="science-story">';
    html +=
      '<h3 class="science-story__headline">' +
      story.headline +
      "</h3>";
    html += '<p class="science-story__body">' + story.body + "</p>";
    html += '<div class="science-story__glance">';
    story.at_a_glance.forEach(function (item) {
      html += "<div>";
      html +=
        '<div class="science-story__timing">' +
        item.timing +
        "</div>";
      html +=
        '<div class="science-story__desc">' +
        item.summary +
        "</div>";
      html += "</div>";
    });
    html += "</div></div>";
  }

  // Citations (rendered at the bottom of the page)
  if (pd.timeline_citations && pd.timeline_citations.length) {
    html += '<h4 class="science-citations__title">Citations</h4>';
    html += '<ol class="science-citations">';
    pd.timeline_citations.forEach(function (c) {
      html += "<li>" + c + "</li>";
    });
    html += "</ol>";
  }

  document.getElementById("science-overview-" + product).innerHTML =
    html;
}

// Init the science page only when its containers are present.
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("science-overview-focus")) initScience();
});

