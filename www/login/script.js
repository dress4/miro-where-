"use strict";
const loginForm = document.body.querySelector("#loginForm");
const submits = loginForm.querySelectorAll("button[type='submit']");
const signupForm = document.body.querySelector("#signupForm");
const captchaElem = document.body.querySelector(".g-recaptcha");
let signup = false;
const setSubmit = evt => {
	signup = evt.target.name === "signup";
};
for (const input of submits) {
	input.addEventListener("click", setSubmit);
}
const forgot = html`<a class="transparent" href="javascript:;">Forgot your login? Click here.</a>`;
forgot.addEventListener("click", () => {
	new Miro.Dialog("Forgot Login", html`
		Are you sure you want to send a new password connection to <b>$${loginForm.elements.email.value}</b>?<br>
		The new password will be automatically disconnected once you use it. No other connections will be removed or created. You will have to update the connections in your account settings manually as not to forget your login again.
	`, ["Yes", "No"]).then(value => {
		if (value === 0) {
			Miro.request("POST", "/forgotten_login", {}, {
				email: loginForm.elements.email.value
			}).then(Miro.response(() => {
				new Miro.Dialog("Forgot Login", "An email with a temporary password connection has been sent.");
			}));
		}
	});
});
const enableLoginForm = () => {
	Miro.formState(loginForm, true);
};
const dialogCallback = dialog => {
	dialog.content.appendChild(document.createElement("br"));
	dialog.content.appendChild(document.createElement("br"));
	dialog.content.appendChild(signup ? captchaElem : forgot);
	dialog.then(value => {
		if (value !== -2) {
			enableLoginForm();
		}
	});
};
let signupDialog;
const captchaCallbacks = [];
window.captchaCallback = response => {
	captchaCallbacks.shift()(response);
	grecaptcha.reset();
	if (captchaCallbacks.length) {
		grecaptcha.execute();
	}
};
const executeCaptcha = resolve => {
	captchaCallbacks.push(resolve);
	grecaptcha.execute();
};
const clickResend = () => {
	new Miro.Dialog("Account Verification", "Are you sure you want to resend the verification email?", ["Yes", "No"]).then(value => {
		if (value === 0) {
			Miro.request("POST", "/users/@me/verification", {}, {}).then(Miro.response(() => {
				new Miro.Dialog("Account Verification", "A verification email has been resent. Be sure to check your spam!");
			}));
		}
	});
};
const signUp = async (service, code) => Miro.request("POST", "/users", {
	"X-Captcha": await new Promise(executeCaptcha)
}, {
	connection: `${service} ${btoa(code)}`,
	email: signupDialog.form.elements.email.value,
	name: signupDialog.form.elements.name.value,
	birth: +new Date(signupDialog.form.elements.birth.value)
});
const finishSignup = () => {
	new Miro.Dialog("Account Verification", html`
		A verification email has been sent to <b>$${signupDialog.form.elements.email.value}</b>. Be sure to check your spam!<br>
		If your email is not verified within 30 days, your account will be removed.<br>
		Click <a id="verifyEmail" href="javascript:;">here</a> to resend the verification email.
	`).then(enableLoginForm).form.querySelector("#verifyEmail").addEventListener("click", clickResend);
};
const logIn = async (service, code) => Miro.request("POST", "/token", {}, {
	connection: `${service} ${btoa(code)}`,
	email: loginForm.elements.email.value
});
const finishLogin = xhr => {
	if (xhr.response.unverified) {
		new Miro.Dialog("Account Verification", html`
			A verification email has been sent to <b>$${loginForm.elements.email.value}</b>. Be sure to check your spam!<br>
			If your email is not verified within 30 days, your account will be removed.<br>
			Click <a id="verifyEmail" href="javascript:;">here</a> to resend the verification email.
		`).then(enableLoginForm).form.querySelector("#verifyEmail").addEventListener("click", clickResend);
	} else {
		Miro.reload();
	}
};
loginForm.addEventListener("submit", evt => {
	evt.preventDefault();
	Miro.formState(loginForm, false);
	if (signup) {
		signupDialog = new Miro.Dialog("Signup", signupForm, [{
			text: "Okay",
			type: "submit"
		}, "Cancel"]).then(value => {
			if (value === 0) {
				Miro.auth("Signup", "Secure your Miroware account by connecting it to a login method.\nThe option to change or add more connections is available after signing up.", signUp, dialogCallback, true).then(finishSignup);
			} else {
				enableLoginForm();
			}
		});
		signupDialog.form.elements.email.value = loginForm.elements.email.value;
		signupDialog.form.elements.email.parentNode.querySelector("label").classList.add("mdc-floating-label--float-above");
		setTimeout(() => {
			signupDialog.form.elements.name.focus();
		});
	} else {
		Miro.auth("Login", "Choose a login method.", logIn, dialogCallback).then(finishLogin);
	}
});
