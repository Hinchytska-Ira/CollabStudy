document.addEventListener("DOMContentLoaded", () => {
  fetch("/components/header")
    .then(res => res.text())
    .then(html => {
      document.getElementById("header-placeholder").innerHTML = html;
    });
});
