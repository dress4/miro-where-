(function() {
	window.Miro = {};
	Miro.magic = {};
	Miro.magic.magic = Miro.magic;
	console.log(Miro.magic);
	HTMLFormElement.prototype.disable = function() {
		this.classList.add("mdc-text-field--disabled");
		const inputs = this.querySelectorAll("input, button");
		for(let v of inputs) {
			v.disabled = true;
		}
	};
	HTMLFormElement.prototype.enable = function() {
		this.classList.remove("mdc-text-field--disabled");
		const inputs = this.querySelectorAll("input, button");
		for(let v of inputs) {
			v.disabled = false;
		}
	};
	let rawQuery;
	if(location.href.indexOf("#") !== -1) {
		rawQuery = location.href.slice(0, location.href.indexOf("#"));
	} else {
		rawQuery = location.href;
	}
	if(rawQuery.indexOf("?") !== -1) {
		rawQuery = rawQuery.slice(rawQuery.indexOf("?")+1).split("&");
	} else {
		rawQuery = [];
	}
	Miro.query = {};
	for(let v of rawQuery) {
		try {
			const p = v.split("=");
			Miro.query[p[0]] = decodeURIComponent(p[1]);
		} catch(err) {}
	}
	Miro.request = function(method, url, data, headers, success, error, noMagic) {
		data = data || {};
		headers = headers || {};
		const req = new XMLHttpRequest();
		req.open(method, url, true);
		Object.keys(headers).forEach(function(i) {
			req.setRequestHeader(i, headers[i]);
		});
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		req.onreadystatechange = function() {
			if(req.readyState === XMLHttpRequest.DONE && req.status) {
				statusType = Math.floor(req.status/100);
				if(noMagic || req.getResponseHeader("X-Magic") === "real") {
					if(statusType === 2) {
						if(typeof success === "function") {
							success(req.responseText);
						}
					} else if(statusType === 4 || statusType === 5) {
						if(typeof error === "function") {
							error(req.status);
						}
					}
				} else if(typeof error === "function") {
					error(req.status);
				}
			}
		};
		let formData = "";
		Object.keys(data).forEach(function(i) {
			formData += `${(formData ? "&" : "") + encodeURIComponent(i)}=${encodeURIComponent(data[i])}`;
		});
		req.send(formData);
	};
	const drawer = new mdc.drawer.MDCTemporaryDrawer(document.querySelector(".mdc-drawer--temporary"));
	document.querySelector("#menu").addEventListener("click", function() {
		drawer.open = true;
	});
	const textFields = document.querySelectorAll(".mdc-text-field");
	for(let v of textFields) {
		new mdc.textField.MDCTextField(v);
	}
	const ripples = document.querySelectorAll(".ripple");
	for(let v of ripples) {
		new mdc.ripple.MDCRipple(v);
	}
})();
