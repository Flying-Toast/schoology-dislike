let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);


function main() {
	Array.from(document.querySelectorAll(".like-btn")).forEach(function(i) {
		let dislikeButton = document.createElement("span");
		dislikeButton.className = "clickable like-btn";

		let buttonContent = document.createElement("span");
		buttonContent.className = "content";
		buttonContent.innerText = " Dislike";

		dislikeButton.appendChild(buttonContent);

		i.parentNode.insertBefore(dislikeButton, i.nextSibling);
		i.outerHTML += "·";
	});
}
