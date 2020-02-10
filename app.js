window.onload = () => {
  document
    .getElementById("discussionInput")
    .addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        const text = event.target.value.trim();
        if (text && text.trim().length) {
          const allDiscussions = [
            ...JSON.parse(localStorage.getItem("discussions"))
          ];
          const newDiscussion = createNode(allDiscussions.length, text);
          updateStore(allDiscussions, newDiscussion);
          createDiscussionComponent(newDiscussion);
          updateTimestamps();
          document.getElementById(
            "results"
          ).scrollTop = document.getElementById("results").scrollHeight;
        } else {
          showError("Oops!! You forgot to type");
        }
      }
    });

  /* function for handling document click events */
  onDocumentClick();
  /* remove the below function if number of elements in DOM are limited and bind the events on the respective elements (upVote, downVote, reply) for better performance */
  captureClickEvents(); //Event delegation

  init(); //initialize rendering and initial setup
};

/* List of names of persons which will be picked in a random manner */
const persons = [
  "Jon Snow",
  "Sansa Stark",
  "Arya Stark",
  "Tyrion Lannister",
  "Khal Drogo",
  "Daenerys Targaryen",
  "Missandei",
  "Tyene Sand"
];

/* Main object constructor */
class node {
  constructor(index, text, vote, reply) {
    this.owner = {
      name: persons[Math.floor(Math.random() * persons.length)],
      timestamp: new Date().getTime()
    };
    this.index = index;
    this.text = text;
    this.votes = vote || 0;
    this.reply = reply || []; //will again contain object with node structure
  }
}

/* function for creating a new node structure */
const createNode = (index = 0, value) => {
  return new node(index, value);
};

/* function for handling document clicks */
const onDocumentClick = () => {
  document.addEventListener("click", event => {
    if (
      document.getElementById("replyInput") &&
      !event.target.className.split(" ").includes("Reply")
    ) {
      document
        .getElementById("replyInput")
        .removeEventListener("keypress", onInputEnter);
      document.getElementById("replyInput").remove();
    }
  });
};

/* function for capturing element click events allowing event capturing and preventing event bubbling */
const captureClickEvents = () => {
  document.getElementById("results").addEventListener("click", event => {
    if (event.target.className.includes("upVote")) {
      return updateVotes("inc");
    }
    if (event.target.className.includes("downVote")) {
      return updateVotes("desc");
    }
    if (event.target.className.includes("Reply")) {
      const parent = event.target.parentElement;
      let childElement = document.getElementById("replyInput");
      /* condition for toggling the reply input */
      if (childElement) {
        if (childElement.dataset.index != parent.dataset.index) {
          childElement.removeEventListener("keypress", onInputEnter);
          childElement.remove();
        } else {
          return;
        }
      }
      /* call for creating reply input box */
      return createReplyInput(parent);
    }
  });
};

/* function to update store */
const updateStore = (allDiscussions = null, newDiscussion = null) => {
  if (allDiscussions && newDiscussion) {
    allDiscussions.push(newDiscussion);
    localStorage.setItem("discussions", JSON.stringify(allDiscussions));
  }
};

/* creation of discussion container component */
const createDiscussionComponent = (newDiscussion = {}, parent = null) => {
  if (newDiscussion.text && newDiscussion.text.trim().length) {
    if (document.getElementById("emptyState")) {
      document.getElementById("emptyState").remove();
    }
    const container = document.createElement("div");
    setAttributes(container, {
      class: "discussionContainer",
      "data-index": newDiscussion.index
    });
    if (parent) {
      parent.appendChild(container);
    } else {
      document.getElementById("results").appendChild(container);
    }
    createDiscussionOwnerComponent(container, newDiscussion);
    createDiscussionTextComponent(container, newDiscussion);
    createActionContainer(container, newDiscussion);
    if (newDiscussion.reply && newDiscussion.reply.length) {
      newDiscussion.reply.forEach(discussion => {
        createDiscussionComponent(discussion, container);
      });
    }
  }
};

/* creation of user information component */
const createDiscussionOwnerComponent = (
  parent = null,
  newDiscussion = null
) => {
  if (parent && newDiscussion) {
    /* creating user information container */
    let newElement = document.createElement("p");
    newElement.setAttribute("class", "discussionInfo");
    parent.appendChild(newElement);

    /* setting user name */
    const username = document.createElement("span");
    username.style.fontWeight = "700";
    username.appendChild(document.createTextNode(newDiscussion.owner.name));
    newElement.appendChild(username);

    /* setting elapsed time */
    const timeDiff = document.createElement("span");
    timeDiff.setAttribute("data-time", parent.dataset.index);
    timeDiff.setAttribute("class", "timeElapsed");
    timeDiff.appendChild(
      document.createTextNode(
        timeDifference(new Date().getTime(), newDiscussion.owner.timestamp)
      )
    );
    timeDiff.style.marginLeft = "5px";
    newElement.appendChild(timeDiff);
  }
};

/* creation of discussion topic component */
const createDiscussionTextComponent = (parent = null, newDiscussion = null) => {
  if (parent && newDiscussion) {
    let newElement = document.createElement("p");
    newElement.appendChild(document.createTextNode(newDiscussion.text));
    setAttributes(newElement, {
      style: "font-family: monospace; font-weight: bold; word-break: break-all;"
    });
    parent.appendChild(newElement);
    document.getElementById("discussionInput").value = null; //resetting discussion input value
    return newElement;
  }
};

/* creation of call to action (CTA) component */
const createActionContainer = (parent = null, newDiscussion = null) => {
  if (parent && newDiscussion) {
    const newElement = document.createElement("div");
    newElement.setAttribute("class", `discussionInfo actions`);
    parent.appendChild(newElement);
    createVoteComponent(newElement, newDiscussion); //call to creation of vote action component
    const reply = createActionComponent(newElement, "Reply"); //creation of call to reply action component
    /* uncomment the below code for binding events to elements when number of elements in DOM are limited */
    // reply.addEventListener("click", event => {
    //   createReplyInput(parent);
    // });
  }
};

/* creation of votes component */
const createVoteComponent = (parent = null, newDiscussion = null) => {
  if (parent && newDiscussion) {
    const voteElement = document.createElement("div");
    setAttributes(voteElement, {
      class: "votes",
      style: "display: inline-block;",
      "data-index": newDiscussion.index
    });
    voteElement.appendChild(document.createTextNode(newDiscussion.votes));
    parent.appendChild(voteElement);
    const upVote = createActionComponent(parent, "upVote"); //creation of upVote component
    /* bind events to individual elements if number of elements in DOM are limited and remove the event from #results */
    // upVote.addEventListener("click", () => {
    //   updateVotes("inc");
    // });
    const downVote = createActionComponent(parent, "downVote"); //creation of downVote component
    /* bind events to individual elements if number of elements in DOM are limited and remove the event from #results */
    // downVote.addEventListener("click", () => {
    //   updateVotes("desc");
    // });
  }
};

/* creation of child component of upVote & downVote components */

const createActionComponent = (parent = null, type = null) => {
  if (parent && type) {
    const elem = document.createElement("span");
    elem.style.marginLeft = "15px";
    elem.setAttribute("class", `cursorPointer ${type}`);
    if (type === "Reply") {
      elem.appendChild(document.createTextNode(type));
    } else {
      setAttributes(elem, { class: `${type} arrow` });
    }
    parent.appendChild(elem);
    return elem;
  }
};

/* creation of reply input component */
const createReplyInput = (parent = null) => {
  if (parent) {
    const newElement = document.createElement("input");
    newElement.id = "replyInput";
    setAttributes(newElement, {
      type: "text",
      class: "replyInput discussionInput small",
      onclick: "event.stopPropagation()", //preventing event bubbling
      "data-index": parent.dataset.index,
      placeholder: "Reply to discussion ..."
    });
    newElement.addEventListener("keypress", event => {
      onInputEnter(event);
    });
    parent.appendChild(newElement);
    newElement.focus();
  }
};

/* action for saving replies */
const onInputEnter = event => {
  if (event.keyCode === 13) {
    if (event.target.value && event.target.value.trim().length) {
      const text = event.target.value.trim();
      const allDiscussions = JSON.parse(localStorage.getItem("discussions"));
      const parentElement = event.target.parentElement.parentElement;
      const selectedObject = getSelectedObject(allDiscussions, parentElement);
      const newDiscussion = createNode(
        `${parentElement.dataset.index}.${selectedObject.reply.length}`,
        text
      );
      selectedObject.reply.push(newDiscussion);
      localStorage.setItem("discussions", JSON.stringify(allDiscussions));
      createDiscussionComponent(newDiscussion, parentElement);
      document
        .getElementById("replyInput")
        .removeEventListener("keypress", onInputEnter);
      document.getElementById("replyInput").remove();
      updateTimestamps();
    } else {
      showError("Oops!! You forgot to type");
    }
  }
};

/* method for getting selected Object */
const getSelectedObject = (parentObject, parentElement) => {
  let selectedObject = null;
  const index = parentElement.dataset.index
    ? parentElement.dataset.index
    : parentElement.dataset.time
    ? parentElement.dataset.time
    : null;
  if (index) {
    const indexArr = index.split(".");
    indexArr.forEach((elem, index) => {
      if (index) {
        selectedObject = selectedObject.reply[+elem];
      } else {
        selectedObject = parentObject[+elem];
      }
    });
  }
  return selectedObject;
};

/* function for initial rendering */
const init = () => {
  if (!localStorage.getItem("discussions")) {
    localStorage.setItem("discussions", JSON.stringify([]));
  } else {
    let discussions = [...JSON.parse(localStorage.getItem("discussions"))];
    discussions.forEach(elem => {
      createDiscussionComponent(elem);
    });
  }
};

/* function for setting element attributes at once */
setAttributes = (el, attrs) => {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* function for updating vote counts */
const updateVotes = (action = null) => {
  if (action) {
    const allDiscussions = JSON.parse(localStorage.getItem("discussions"));
    const selectedElement = event.target.parentElement.firstElementChild;
    let selectedObject = getSelectedObject(allDiscussions, selectedElement);
    selectedObject.votes =
      action === "inc" ? selectedObject.votes + 1 : selectedObject.votes - 1;
    localStorage.setItem("discussions", JSON.stringify(allDiscussions));
    selectedElement.innerText = selectedObject.votes;
  }
  // uncomment the below function to update counts on vote pulsation
  /* updateTimestamps(); */
};

/* function for updating timestamps */
const updateTimestamps = () => {
  const allDiscussions = JSON.parse(localStorage.getItem("discussions"));
  const timestamps = document.querySelectorAll("[data-time]");
  if (timestamps.length) {
    timestamps.forEach(elem => {
      const selectedObject = getSelectedObject(allDiscussions, elem);
      const newTime = timeDifference(
        new Date().getTime(),
        selectedObject.owner.timestamp
      );
      if (elem.innerText != newTime) {
        fadeIn(
          elem,
          timeDifference(new Date().getTime(), selectedObject.owner.timestamp)
        );
      }
    });
  }
};

/* function for adding fade-in animation */
const fadeIn = (element, value = null) => {
  element.classList.add("fadeInOut");
  if (value) {
    setTimeout(function() {
      element.textContent = value;
    }, 500);
  }
  setTimeout(function() {
    element.classList.remove("fadeInOut");
  }, 500);
};

const showError = (text = "Something went wrong") => {
  const error = document.createElement("div");
  error.append(document.createTextNode(text));
  error.style.left = `${window.innerWidth - 250}px`;
  document.getElementById("errors").appendChild(error);
  fadeIn(error);
  setTimeout(() => error.remove(), 3000);
};

/* function for getting elapsed time */
const timeDifference = (current, previous) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsedTime = current - previous;
  if (elapsedTime < msPerMinute) {
    return Math.round(elapsedTime / 1000)
      ? Math.round(elapsedTime / 1000) + " secs ago"
      : "Just Now";
  } else if (elapsedTime < msPerHour) {
    return Math.round(elapsedTime / msPerMinute) > 1
      ? `${Math.round(elapsedTime / msPerMinute)} mins ago`
      : `${Math.round(elapsedTime / msPerMinute)} min ago`;
  } else if (elapsedTime < msPerDay) {
    return Math.round(elapsedTime / msPerHour) > 1
      ? `${Math.round(elapsedTime / msPerHour)} hours ago`
      : `${Math.round(elapsedTime / msPerHour)} hour ago`;
  } else if (elapsedTime < msPerMonth) {
    return Math.round(elapsedTime / msPerDay) > 1
      ? `${Math.round(elapsedTime / msPerDay)} days ago`
      : `${Math.round(elapsedTime / msPerDay)} day ago`;
  } else if (elapsedTime < msPerYear) {
    return Math.round(elapsedTime / msPerMonth) > 1
      ? `${Math.round(elapsedTime / msPerMonth)} months ago`
      : `${Math.round(elapsedTime / msPerMonth)} month ago`;
  } else {
    return Math.round(elapsedTime / msPerYear) > 1
      ? `${Math.round(elapsedTime / msPerYear)} years ago`
      : `${Math.round(elapsedTime / msPerYear)} year ago`;
  }
};
