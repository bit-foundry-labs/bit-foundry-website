const checkoutLinks = {
  spaceman: "",
  "os-notes": "https://brittneyleighb.gumroad.com/l/smbpyt"
};

const dialog = document.querySelector("#checkout-dialog");

document.querySelectorAll("[data-product]").forEach((button) => {
  button.addEventListener("click", () => {
    const checkoutUrl = checkoutLinks[button.dataset.product];
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      return;
    }
    dialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
document.querySelector(".dialog-done").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector("#year").textContent = new Date().getFullYear();
