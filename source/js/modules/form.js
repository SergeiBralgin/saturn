const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', onPhoneInput);
phoneInput.addEventListener('focus', onPhoneFocus);
phoneInput.addEventListener('blur', onPhoneBlur);

function onPhoneInput(e) {
	let input = e.target;
	let value = input.value.replace(/\D/g, '');

	if (value.startsWith('7')) {
		value = value.slice(1);
	}

	let formatted = '+7';

	if (value.length > 0) {
		formatted += ' (' + value.substring(0, 3);
	}
	if (value.length >= 4) {
		formatted += ') ' + value.substring(3, 6);
	}
	if (value.length >= 7) {
		formatted += '-' + value.substring(6, 8);
	}
	if (value.length >= 9) {
		formatted += '-' + value.substring(8, 10);
	}

	input.value = formatted;
}

function onPhoneFocus(e) {
	if (e.target.value === '') {
		e.target.value = '+7 ';
	}
}

function onPhoneBlur(e) {
	if (e.target.value === '+7 ') {
		e.target.value = '';
	}
}

const form = document.querySelector('form');

form.addEventListener('submit', function (e) {
	const phone = phoneInput.value.replace(/\D/g, '');

	if (phone.length !== 11) {
		e.preventDefault();
		alert('Введите корректный номер телефона');
		phoneInput.focus();
	}
});
