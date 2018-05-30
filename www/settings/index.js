(() => {
	const _input = Symbol("input");
	const _prevValue = Symbol("prevValue");
	const editField = function() {
		this.parentNode.classList.add("hidden");
		this.parentNode.nextSibling.classList.remove("hidden");
		this.form[_input].disabled = false;
		this.form[_prevValue] = this.value;
		this.form[_input].select();
	};
	const closeField = function() {
		this.parentNode.classList.add("hidden");
		this.parentNode.previousSibling.classList.remove("hidden");
		this.form[_input].disabled = true;
		this.value = this.form[_prevValue];
	};
	const saveField = function() {
		// TODO
		this.parentNode.classList.add("hidden");
		this.parentNode.previousSibling.classList.remove("hidden");
	};
	for(const v of document.querySelectorAll(".field")) {
		v[_input] = v.querySelector("input");
		v.querySelector(".editfield").addEventListener("click", editField);
		v.querySelector(".closefield").addEventListener("click", closeField);
		v.querySelector(".savefield").addEventListener("click", saveField);
	}
})();
