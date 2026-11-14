const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-cat]");

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("is-on"));
    btn.classList.add("is-on");
    const value = btn.dataset.filter;
    cards.forEach((card) => {
      const show = value === "todos" || card.dataset.cat === value;
      card.classList.toggle("hidden", !show);
    });
  });
});

const form = document.querySelector("#briefing");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("nome") || "";
    const email = data.get("email") || "";
    const project = data.get("projeto") || "";
    const message = data.get("mensagem") || "";
    const body = encodeURIComponent(
      `Nome: ${name}\nE-mail: ${email}\nProjeto: ${project}\n\n${message}`
    );
    window.location.href = `mailto:contato@joaoroim.com.br?subject=${encodeURIComponent("Briefing — " + name)}&body=${body}`;
    form.reset();
    const note = form.querySelector(".form-note");
    if (note) note.textContent = "Abrindo seu e-mail para enviar o briefing.";
  });
}
