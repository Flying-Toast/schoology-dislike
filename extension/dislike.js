let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);


function main() {
	Array.from(document.querySelectorAll(".like-btn")).forEach(function(i) {
		const postID = i.id.split("-").pop();

		let dislikeButton = document.createElement("span");
		dislikeButton.style.fontWeight = "normal";
		dislikeButton.style.cursor = "pointer";
		dislikeButton.style.color = "#4479b3";

		let buttonContent = document.createElement("span");
		buttonContent.className = "content";
		buttonContent.innerText = "Dislike";
		dislikeButton.appendChild(buttonContent);

		i.parentNode.insertBefore(dislikeButton, i.nextSibling);
		i.after("· ");
	});
}
