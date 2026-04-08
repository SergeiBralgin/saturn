(() => {
  // source/js/modules/form.js
  var phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("input", onPhoneInput);
  phoneInput.addEventListener("focus", onPhoneFocus);
  phoneInput.addEventListener("blur", onPhoneBlur);
  function onPhoneInput(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, "");
    if (value.startsWith("7")) {
      value = value.slice(1);
    }
    let formatted = "+7";
    if (value.length > 0) {
      formatted += " (" + value.substring(0, 3);
    }
    if (value.length >= 4) {
      formatted += ") " + value.substring(3, 6);
    }
    if (value.length >= 7) {
      formatted += "-" + value.substring(6, 8);
    }
    if (value.length >= 9) {
      formatted += "-" + value.substring(8, 10);
    }
    input.value = formatted;
  }
  function onPhoneFocus(e) {
    if (e.target.value === "") {
      e.target.value = "+7 ";
    }
  }
  function onPhoneBlur(e) {
    if (e.target.value === "+7 ") {
      e.target.value = "";
    }
  }
  var form = document.querySelector("form");
  form.addEventListener("submit", function(e) {
    const phone = phoneInput.value.replace(/\D/g, "");
    if (phone.length !== 11) {
      e.preventDefault();
      alert("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430");
      phoneInput.focus();
    }
  });
})();
//# sourceMappingURL=bundle.js.map
