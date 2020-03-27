let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);

function main() {
	loadCustomStyle();

	Array.from(document.querySelectorAll(".like-btn")).forEach(function(i) {
		const postID = i.id.split("-").pop();

		let dislikeButton = document.createElement("span");
		dislikeButton.className = "dislike-btn";

		let buttonContent = document.createElement("span");
		buttonContent.className = "content";
		buttonContent.innerText = "Dislike";
		dislikeButton.appendChild(buttonContent);

		i.parentNode.insertBefore(dislikeButton, i.nextSibling);
		i.after("· ");
	});
}

function loadCustomStyle() {
	let el = document.createElement("style");
	document.head.appendChild(el);

	el.sheet.insertRule(`.dislike-btn { font-weight: normal; cursor: pointer; color: #4479B3; }`);
	el.sheet.insertRule(`.dislike-btn:hover { text-decoration: underline; }`);
}
