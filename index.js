// Find the application/ld+json
let scripts = document.querySelectorAll('script[type="application/ld+json"]');

loop:
for (let script of scripts) {
	try {
		// Try to parse each script as json
		let json = JSON.parse(script.innerHTML);

		if (json['@graph']) {
			json = json['@graph'];
		}

		// Ensure it's an array
		if (!Array.isArray(json)) {
			json = [json];
		}

		// Find the recipe schema
		for (let schema of json) {
			if (schema['@type'].toLowerCase() === 'recipe') {

				// TODO: Apply mods for certain domains

				// Render the recipe
				document.body.innerHTML =
`
<div class="recipe-image">
	<img src="${schema.image[0]}" alt="An image of ${schema.name}" />
</div>
<h1>${schema.name}</h1>
${schema.description ? `<p><i>${schema.description}</i></p>` : ''}

<h2>Ingredients</h2>

<ul class="ingredients-list">
${schema.recipeIngredient.reduce((prev, curr) => prev +
	`<li>${curr}</li>`
, '')}
</ul>

<h2>Directions</h2>

<ol style="margin:0.125in; padding:0; overflow: visible; display: block">
${schema.recipeInstructions.reduce((prev, curr) => prev +
	`<li>${curr.text}<br></li>`
, '')}
</ol>

<a href="${window.location}">${window.location}</a>
`;

				// Clear all the styles
				document.querySelectorAll('style, link[rel="stylesheet"]')
					.forEach(el => el.parentNode.removeChild(el));

				// Add custom styles
				document.head.insertAdjacentHTML('beforeend',
`
<style type="text/css">
* {
  box-sizing: border-box;
}
:root, html, body {
  background: #f2f2f2;
  color: #444444;
  text-shadow: 0 1px 0 #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6181;
  margin: 0;
  padding: 0;
  height: 100%; /* Fallback */
  height: 100vh;
  width: 100%; /* Fallback */
  width: 100vw;
}

body {
  margin: 1rem auto;
  width: 90%;
}

h1 {
  font-size: 2rem;
}

p {
  font-size: 1rem;
}

a {
  color: #444444;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

nav.nav {
  text-align: right;
  font-size: 0.6875rem; /* 11px */
}

@media screen and (min-width: 480px) {
  body {
      max-width: 800px;
  }
}
@media screen and (min-width: 660px) {
  .supported-list {
      columns: 2;
  }
}
@media screen and (min-width: 980px) {
  .supported-list {
      columns: 3;
  }
}
@media screen and (min-width: 1220px) {
  :root, html, body {
      font-size: 18px;
  }
  body {
      max-width: 1000px;
  }
}

a {
  border-bottom: 1px solid #444444;
  color: #444444;
  text-decoration: none;
}
a:hover {
  border-bottom: 0;
}

.recipe-image {
  font-size: 0;
}

.recipe-image img {
  width: 100%;
}

li {
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
}

.ingredients-list {
  columns: 1;
  padding-left: 2rem;
}

@media screen and (min-width: 480px) {
  .recipe-image {
    float: right;
    margin: 0.75rem;
  }
  .recipe-image img {
    width: 250px;
  }
}
@media screen and (min-width: 660px) {
  .ingredients-list {
    columns: 2;
  }
}
@media screen and (min-width: 1220px) {
  .ingredients-list {
    columns: 3;
  }
}

/* Print styles */
@media print {
  @page {
    size: 6in 4in landscape;
    margin: 0.125in;
  }
  body {
    color: black;
    width: 6in;
    height: 4in;
    margin: 0.125in;
    font-size: 9pt;
    line-height: 1.2;
    overflow: visible;
    font-family: Helvetica, sans-serif;
  }
  h1 {
    font-size: 10pt;
    font-weight: bold;
  }
  h2 {
    display: none;
  }
  img {
    display: none;
  }
  a {
    color: black;
    text-decoration: none
  }
  body {
    margin: 0;
    padding: 0;
    max-width: auto;
    width: 100%;
  }
  .ingredients-list {
    columns: 3;
    column-gap: 0.2in;
    padding-left: 0.125in;
  }
}
</style>
`);
				
				break loop;
			}
		}
	} catch (e) {}
}