let loadedCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		clearInterval(loadedCheckInterval);
		main();
	}
}, 500);

let _dislikeCache = new Map();
function cacheDislikes(postID) {
	if (_dislikeCache.has(postID)) {
		return;
	}

	_dislikeCache.set(postID,
		// TODO
		// will query the backend, for now just returns placeholder data
		[{
			name: "Nicole Weng",
			userID: 10790849
		},{
			name: "Isabella Shaw",
			userID: 10781739
		},{
			name: "Simon Schwartz",
			userID: 10785041
		}]
	);
}

function getDislikes(postID) {
	cacheDislikes(postID);
	return _dislikeCache.get(postID);
}

let _idOfLoggedInUser = null;
function myID() {
	return _idOfLoggedInUser;
}

function main() {
	let dropdownToggle = document.querySelector(`div[data-sgy-sitenav="header-my-account-menu"]`).children[0];
	dropdownToggle.click();

	_idOfLoggedInUser = document.querySelector(`div[data-sgy-sitenav="header-my-account-menu"]`)
							.children[1].children[0].querySelector(`[role="menuitem"]`).href.split("/")
							.slice(-2)[0];
	dropdownToggle.click();
	loadCustomStyle();

	domUpdateTick();
	setInterval(domUpdateTick, 1000);
}

function loadCustomStyle() {
	let el = document.createElement("style");
	document.head.appendChild(el);

	el.sheet.insertRule(`.dislike-btn:hover { text-decoration: underline; }`);
	el.sheet.insertRule(`.dislike-wrapper:hover > .dislike-count { text-decoration: underline; }`);
}

function makeDislikeIcon() {
	let dislikeIcon = document.createElement("img");
	dislikeIcon.src = browser.extension.getURL("dislike-icon.png");
	dislikeIcon.width = 15;
	dislikeIcon.height = 15;
	dislikeIcon.style.verticalAlign = "text-bottom";
	dislikeIcon.style.position = "relative";
	dislikeIcon.style.bottom = "2px";
	return dislikeIcon;
}

function domUpdateTick() {
	const likeButtons = Array.from(document.querySelectorAll(".like-btn"));
	likeButtons.forEach(function(i) {
		let dislikeButton = i.parentElement.querySelector(".dislike-btn");
		if (dislikeButton == null) {
			addDislikeButton(i);
		}
	});
	likeButtons.forEach(function(i) {
		tickDislikeButton(i);
	});
}

function isComment(postID) {
	let dislikeButton = document.querySelector(`#dislike-id-${postID}`);
	return dislikeButton.parentNode.className.split("-")[0] == "comment";
}

function addDislikeButton(likeButtonElement) {
	let likeContent = likeButtonElement.querySelector(".content");
	likeContent.innerText = likeContent.innerText.trimEnd();

	const postID = likeButtonElement.id.split("-").pop();
	setInterval(function() {
		cacheDislikes(postID);
	}, 0);

	let dislikeButton = document.createElement("span");
	dislikeButton.id = `dislike-id-${postID}`;
	dislikeButton.className = "dislike-btn";
	dislikeButton.style.fontWeight = "normal";
	dislikeButton.style.cursor = "pointer";
	dislikeButton.style.color = "#4479B3";
	dislikeButton.addEventListener("click", dislikeClickHandler);

	let buttonContent = document.createElement("span");
	buttonContent.id = `dislike-content-id-${postID}`;
	buttonContent.className = "content";
	dislikeButton.appendChild(buttonContent);

	let icon = makeDislikeIcon();

	likeButtonElement.parentNode.insertBefore(dislikeButton, likeButtonElement.nextSibling);
	likeButtonElement.after(" · ");
	if (isComment(postID)) {
		let divider = document.createElement("span");
		divider.id = `divider-${postID}`;
		divider.innerText = " · ";
		divider.style.color = "#677583";

		let wrapper = document.createElement("span");
		wrapper.id = `dislike-wrapper-${postID}`;
		wrapper.className = "dislike-wrapper";
		wrapper.style.cursor = "pointer";
		let dislikeCount = document.createElement("span");
		dislikeCount.id = `dislike-count-${postID}`;
		dislikeCount.className = "dislike-count";
		dislikeCount.innerText = " ";
		dislikeCount.style.marginLeft = "4px";
		dislikeCount.style.color = "#4479B3";
		wrapper.appendChild(icon);
		wrapper.appendChild(dislikeCount);

		dislikeButton.parentNode.insertBefore(divider, dislikeButton.nextSibling);
		divider.parentNode.insertBefore(wrapper, divider.nextSibling);
	}
}

function tickDislikeButton(likeButtonElement) {
	const postID = likeButtonElement.id.split("-").pop();
	const postDislikes = getDislikes(postID);

	let buttonContent = document.querySelector(`#dislike-content-id-${postID}`);

	if (postDislikes.some(i => i.userID == myID())) {
		buttonContent.innerText = "Un-dislike";
	} else {
		buttonContent.innerText = "Dislike";
	}

	if (isComment(postID)) {
		let divider = document.querySelector(`#divider-${postID}`);
		let wrapper = document.querySelector(`#dislike-wrapper-${postID}`);

		let dislikeCount = document.querySelector(`#dislike-count-${postID}`);
		dislikeCount.innerText = postDislikes.length;

		if (postDislikes.length == 0) {
			wrapper.style.display = "none";
			divider.style.display = "none";
		} else {
			wrapper.style.display = "";
			divider.style.display = "";
		}
	}
}

function dislikeClickHandler(e) {
	const postID = e.target.id.split("-").pop();
	//console.log(getDislikes(postID));
	console.log(isComment(postID));
	listDislikers(postID);
}

let popupInProgress = false;
function listDislikers(postID) {
	if (popupInProgress) {
		return;
	}
	popupInProgress = true;
	let popup = document.createElement("div");
	popup.id = "dislikers-popup";
	popup.className = "popups-box popups-medium likers";
	popup.style.position = "fixed";
	popup.style.left = "50vw";
	popup.style.top = "50vh";
	popup.style.transform = `translate(-50%, -50%)`;
	popup.setAttribute("role", "dialog");
	popup.innerHTML = `<div class="popups-title">
    <div class="popups-close"><a id="dislikers-close-1"><span class="visually-hidden">Close</span></a></div>
    <div class="title">People who dislike this</div>
    <div class="clear-block"></div>
</div>
<div class="popups-body" tabindex="0">
    <div class="item-list">
        <ul id="dislikers-list"></ul>
    </div>
    <div class="submit-buttons"><a id="dislikers-close-2" class="cancel-btn schoology-processed sExtlink-processed">Close</a></div>
</div>
<div class="popups-buttons" tabindex="0"></div>
<div class="popups-footer"></div>`;

	document.body.appendChild(popup);
	let closeButtons = [document.querySelector("#dislikers-close-1"), document.querySelector("#dislikers-close-2")];
	for (let btn of closeButtons) {
		btn.addEventListener("click", function() {
			popup.remove();
			popupInProgress = false;
		});
	}

	let list = document.querySelector("#dislikers-list");
	const dislikers = getDislikes(postID);

	for (let person of dislikers) {
		let listItem = document.createElement("li");
		listItem.innerHTML = `<div class="picture">
	<a class="disliker-profile-link-1 sExtlink-processed">
		<div class="profile-picture-wrapper sUser-processed">
			<div class="profile-picture"><img title="" class="imagecache imagecache-profile_sm"></div>
		</div>
	</a>
</div>
<div class="vertical-center"><a class="disliker-profile-link-2" title="View user profile." class="sExtlink-processed"></a></div>`;

		let firstLink = listItem.querySelector(".disliker-profile-link-1");
		firstLink.href = `/user/${person.userID}`;
		firstLink.title = person.name;
		firstLink.querySelector("img").src = profileImageURL(person.userID);
		let secondLink = listItem.querySelector(".disliker-profile-link-2");
		secondLink.href = `/user/${person.userID}`;
		secondLink.innerText = person.name;

		list.appendChild(listItem);
	}
}

function profileImageURL(userID) {
	return `https://asset-cdn.schoology.com/users/${userID}/profile-image/profile_sm`;
}
