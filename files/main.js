/**
 * Takes the contents of the pageContent variable and outputs them.
 */
function createTimeline() {
  const timeline = parsePageContent();

  let stdout = document.getElementById("timeline").children[0];

  let currentYear = null;
  let yearSection = null;
  for(const event of timeline) {
    if(currentYear != event.year) {  // Crea un nuovo anno se necessario
      currentYear = event.year;

      const yearText = document.createElement("h3");
      yearText.innerHTML = currentYear;

      yearSection = document.createElement("section");
      yearSection.classList.add("year");
      yearSection.appendChild(yearText);
      stdout.appendChild(yearSection);
    }

    const section = document.createElement("section");
    if(event.month !== undefined) {
      const month = document.createElement("h4");
      month.innerHTML = event.month;
      section.appendChild(month);
    }

    const timelineEvent = document.createElement("ul");
    const item = document.createElement("li");
    item.innerHTML = parseLinks(event.description);
    timelineEvent.appendChild(item);
    section.appendChild(timelineEvent);

    yearSection.appendChild(section);
  }
}

/**
 * Translates wikidot language into an array of objects.
 *
 * @return {Object[]}  A list of tag data.
 */
function parsePageContent() {
  const tagRegex = /\[\[component:timeline-node\s([\w\W]+?)]]/gm;
  let tags = [];
  let tagContent = tagRegex.exec(pageContent);
  while(tagContent !== null) {
    tags.push(tagContent[1]);
    tagContent = tagRegex.exec(pageContent);
  }

  tags = tags.map((t) => {
    let ret = {};

    const splitTags = splitTagParameters(t);
    for(const splitT of splitTags) {
      const key = splitT.split("=", 1);
      const value = splitT.replace(`${key}=`, "");
      ret[key] = value;
    }

    return ret;
  });

  return tags;
}

/**
 * Splits the timeline-node tag into parameters.
 *
 * To add or remove a new key, just change the allowedKeys array.
 *
 * @param  {string}   tag  The tag data.
 * @return {string[]}      The parameters, formatted like "key=value".
 */
function splitTagParameters(tag) {
  const allowedKeys = ["year", "month", "description"];

  let params = tag.split("|");
  for(let i = params.length-1; i >= 0; i--) {
    const current = params[i];

    let isKeyStart = false;
    for(const key of allowedKeys) {
      if(current.trim().startsWith(key)) {
        isKeyStart = true;
        break;
      }
    }

    if(!isKeyStart) {
      params[i-1] += `|${params[i]}`;
      params.splice(i, 1);
    }
    else {
      params[i] = params[i].trim();
    }
  }

  return params;
}

/**
 * Translates wikidot links to HTML.
 *
 * Only works with single-parenthesis hyperlinks,
 * eg: [http://fondazionescp.wikidot.com|Pagina principale]
 * Won't work on links like: [[[SCP-033-IT|Link all'articolo di SCP-033-IT]]]
 *
 * @param {string} text  The text to format.
 */
function parseLinks(text) {
  console.log(text);
  let regex = /\[(https?:\/\/.*?\..*?\..*?\/.*?)\|(.*?)\]/g;
  function replacer(match, link, description) {
    return "<a target=\"_blank\" href=\"" + link + "\">" + description + "</a>";
  }

  return text.replace(regex, replacer);
}
