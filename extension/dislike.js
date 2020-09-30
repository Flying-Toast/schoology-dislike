// NOTE: Remember to change permissions in manifest.json when updating host
const backendHost = "https://schoology-dislike.theschwartz.xyz:8008";

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

	fetch(`${backendHost}/dislikes?post=${postID}`).then(i => i.json()).then(function(data) {
		_dislikeCache.set(postID, data);
	});
}

function toggleDislike(postID) {
	// NOTE
	//
	// In the interest of security, the server does not validate users' dislikes. This is because doing
	// so would involve hijacking their session cookie and sending it to the server, which is pretty bad
	// from a security standpoint. So, it instead uses a simple checksum of the username and user id to slightly
	// deter people from sending 'fake' dislikes from nonexistant users or impersonating other people.
	//
	// If you are reading this right now, you are probably trying to forge dislikes, and, well,
	// you've pretty much done it. The code below calculates the checksum. So just read how it works and you'll
	// be able to create checksums.
	//
	// BUT PLEASE DON'T! This whole thing is made for fun, and creating invalid dislikes ruins the fun for everyone.
	// There's really nothing else stopping you from doing it, but PLEASE - don't be a douchebag.
	let a = (myID().toString() + myName()).split("").map(i => i.charCodeAt(0));
	let b = [];
	let pop = false;
	while (a.length > 0) {
		if (pop) {
			b.push(a.pop());
		} else {
			b.push(a.shift());
		}
		pop = !pop;
	}
	let c = b.join("").split("");
	let d = 0;
	while (c.length > 0) {
		let chunk = [];
		for (let i = 0; i < 5 && c.length > 0; i++) {
			chunk.push(c.pop());
		}
		d += Number(chunk.join(""));
	}
	const h = myID() + postID + d;

	fetch(`${backendHost}/toggle?post=${postID}&id=${myID()}&name=${encodeURIComponent(myName())}&h=${h}`);

	const postDislikes = getDislikes(postID);
	const likedByMe = postDislikes.some(i => i.userID == myID());
	let likeButtonElement = document.querySelector(`#dislike-id-${postID}`).parentNode.querySelector(".like-btn");

	if (likedByMe) {
		_dislikeCache.set(postID, postDislikes.filter(i => i.userID != myID()));
	} else {
		_dislikeCache.set(postID, postDislikes.concat([{
			name: myName(),
			userID: myID()
		}]));
	}
	tickDislikeButton(likeButtonElement);
}

function getDislikes(postID) {
	if (!_dislikeCache.has(postID)) {
		return [];
	}
	return _dislikeCache.get(postID);
}

let _idOfLoggedInUser = null;
function myID() {
	return _idOfLoggedInUser;
}

let _nameOfLoggedInUser = null;
function myName() {
	return _nameOfLoggedInUser;
}

function main() {
	let dropdownToggle = document.querySelector(`div[data-sgy-sitenav="header-my-account-menu"]`).children[0];
	_nameOfLoggedInUser = dropdownToggle.children[0].children[1].innerText;
	dropdownToggle.click();

	_idOfLoggedInUser = Number(document.querySelector(`div[data-sgy-sitenav="header-my-account-menu"]`)
							.children[1].children[0].querySelector(`[role="menuitem"]`).href.split("/")
							.slice(-2)[0]);
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
	let iconSource;
	if (typeof(browser) == "undefined") {
		iconSource = chrome.runtime.getURL("dislike-icon.png");
	} else {
		iconSource = browser.runtime.getURL("dislike-icon.png");
	}
	dislikeIcon.src = iconSource;
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

function addDislikeButton(likeButtonElement) {
	let likeContent = likeButtonElement.querySelector(".content");
	likeContent.innerText = likeContent.innerText.trimEnd();

	const postID = Number(likeButtonElement.id.split("-").pop());
	setTimeout(function() {
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
	wrapper.addEventListener("click", function() {
		listDislikers(postID);
	});

	dislikeButton.parentNode.insertBefore(divider, dislikeButton.nextSibling);
	divider.parentNode.insertBefore(wrapper, divider.nextSibling);
}

function tickDislikeButton(likeButtonElement) {
	const postID = Number(likeButtonElement.id.split("-").pop());
	const postDislikes = getDislikes(postID);

	let buttonContent = document.querySelector(`#dislike-content-id-${postID}`);

	if (postDislikes.some(i => i.userID == myID())) {
		buttonContent.innerText = "Un-dislike";
	} else {
		buttonContent.innerText = "Dislike";
	}

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

function dislikeClickHandler(e) {
	const postID = Number(e.target.id.split("-").pop());
	toggleDislike(postID);
}

let popupInProgress = false;
function listDislikers(postID) {
	if (popupInProgress) {
		return;
	}
	popupInProgress = true;
	let overlay = document.createElement("div");
	overlay.style.backgroundColor = "#ffffff";
	overlay.style.position = "fixed";
	overlay.style.top = "0";
	overlay.style.left = "0";
	overlay.style.width = "100vw";
	overlay.style.height = "100vh";
	overlay.style.opacity = "0.4";
	overlay.style.zIndex = "1";
	document.body.appendChild(overlay);

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
    <div class="title">People who <span style="color: red;">dislike</span> this</div>
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
			overlay.remove();
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
