const cards = document.querySelectorAll(".category-card");
const inputContainer = document.getElementById("categoryInputs");
const categoryBtn = document.getElementById("categoryBtn");
const selectAllBtn = document.getElementById("selectAllBtn");

function updateInputs() {
  inputContainer.innerHTML = "";

  const selected = [];

  cards.forEach((card) => {
    if (card.classList.contains("selected")) {
      const value = card.dataset.value;

      selected.push(value);

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "listing[category]";
      input.value = value;

      inputContainer.appendChild(input);
    }
  });

  categoryBtn.textContent =
    selected.length > 0 ? selected.join(", ") : "Select Categories";
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("selected");
    updateInputs();
  });
});

selectAllBtn.addEventListener("click", () => {
  const allSelected = [...cards].every((card) =>
    card.classList.contains("selected"),
  );

  cards.forEach((card) => {
    card.classList.toggle("selected", !allSelected);
  });

  updateInputs();
});

document.getElementById("doneCategories")?.addEventListener("click", () => {
  bootstrap.Collapse.getOrCreateInstance(
    document.getElementById("categoryOptions"),
  ).hide();
});

if (typeof existingCategories !== "undefined") {
  existingCategories.forEach((category) => {
    cards.forEach((card) => {
      if (card.dataset.value === category) {
        card.classList.add("selected");
      }
    });
  });
}

updateInputs();
